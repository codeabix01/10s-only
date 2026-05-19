import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/application";
import Common "../types/common";
import Storage "mo:caffeineai-object-storage/Storage";
import Email "mo:caffeineai-email/emailClient";
import Debug "mo:core/Debug";

module {
  func toView(app : Types.Application) : Types.ApplicationView {
    { app with id = app.id; applicationId = app.applicationId };
  };

  public func submitApplication(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    inviteCodes : Map.Map<Text, Bool>,
    state : { var nextAppId : Nat },
    input : Types.ApplicationInput,
  ) : Common.ApplicationId {
    if (input.inviteCode != "" and not validateInviteCode(inviteCodes, input.inviteCode)) {
      Runtime.trap("Invalid invite code");
    };
    let duplicate = applications.values().find(func(app) {
      app.email == input.email and (app.status == #approved or app.status == #pending)
    });
    switch (duplicate) {
      case (?_) { Runtime.trap("An application with this email is already pending or approved") };
      case null {};
    };
    let id : Common.ApplicationId = Int.abs(Time.now()) % 9000000 + 1000000;
    state.nextAppId += 1;
    let application : Types.Application = {
      id;
      applicationId = "#" # id.toText();
      name = input.name;
      instagramHandle = input.instagramHandle;
      email = input.email;
      phone = input.phone;
      inviteCode = input.inviteCode;
      plusOne = input.plusOne;
      photos = input.photos;
      status = #pending;
      submittedAt = Time.now();
      qrToken = null;
    };
    applications.add(id, application);
    id;
  };

  public func getApplication(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : ?Types.ApplicationView {
    switch (applications.get(id)) {
      case null null;
      case (?app) ?toView(app);
    };
  };

  public func approveApplication<system>(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : async () {
    switch (applications.get(id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        let token = generateQrToken(id);
        applications.add(id, { app with status = #approved; qrToken = ?token });
        let qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" # token;
        let appIdFormatted = "#" # id.toText();
        let htmlBody = "<html><body style='font-family:sans-serif;background:#0a0a0a;color:#fff;padding:32px'>"
          # "<h1 style='color:#d4af37'>You're In &#8212; 10s Only</h1>"
          # "<p>Hey " # app.name # ",</p>"
          # "<p>Your application has been <strong>approved</strong>!</p>"
          # "<p style='font-size:20px;margin:16px 0'>Application ID: <strong style='color:#d4af37'>" # appIdFormatted # "</strong></p>"
          # "<p>Present this QR code at the door:</p>"
          # "<img src='" # qrUrl # "' alt='Entry QR Code' style='border:4px solid #d4af37'/>"
          # "<p style='margin-top:24px;color:#aaa'>See you on the dance floor.</p>"
          # "<p style='color:#ccc;font-size:14px;margin-top:16px;'>The exact address will be disclosed soon on your WhatsApp number. Stay tuned.</p>"
          # "</body></html>";
        let approveResult = await Email.sendServiceEmail("", [app.email], "You're In. Your Ticket Awaits &#8212; 10s Only", htmlBody);
        switch (approveResult) {
          case (#err(e)) { Debug.print("[Email] Approval email failed for app " # id.toText() # ": " # e) };
          case (#ok) {};
        };
      };
    };
  };

  public func sendSubmissionEmail<system>(app : Types.Application, id : Common.ApplicationId) : async () {
    let appIdFormatted = "#" # id.toText();
    let htmlBody = "<html><body style='font-family:sans-serif;background:#0a0a0a;color:#fff;padding:32px'>"
      # "<h1 style='color:#d4af37'>Application Received &#8212; 10s Only</h1>"
      # "<p>Hey " # app.name # ",</p>"
      # "<p>We've received your application and it's currently <strong>under review</strong>.</p>"
      # "<p style='font-size:20px;margin:16px 0'>Your Application ID: <strong style='color:#d4af37'>" # appIdFormatted # "</strong></p>"
      # "<p>Save this ID &#8212; you'll need it to check your application status.</p>"
      # "<p>You'll be notified as soon as your application is reviewed. Keep an eye on your inbox.</p>"
      # "<p style='margin-top:24px;color:#aaa'>&#8212; The 10s Only Team</p>"
      # "</body></html>";
    let submitResult = await Email.sendServiceEmail("", [app.email], "Application Received &#8212; 10s Only", htmlBody);
    switch (submitResult) {
      case (#err(e)) { Debug.print("[Email] Submission email failed for app " # id.toText() # ": " # e) };
      case (#ok) {};
    };
  };

  public func rejectApplication(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : () {
    switch (applications.get(id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        applications.add(id, { app with status = #rejected });
      };
    };
  };

  public func listApplications(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
  ) : [Types.ApplicationView] {
    let arr = applications.values().map(func(app) { toView(app) }).toArray(
      
    );
    arr.sort<Types.ApplicationView>(func(a, b) { Int.compare(b.submittedAt, a.submittedAt) });
  };

  public func getGuestStatus(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : ?(Types.ApplicationStatus, ?Text) {
    switch (applications.get(id)) {
      case null null;
      case (?app) ?(app.status, app.qrToken);
    };
  };

  public func getApprovedPhotos(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
  ) : [Storage.ExternalBlob] {
    var result : [Storage.ExternalBlob] = [];
    applications.values().forEach(func(app) {
      if (app.status == #approved) {
        result := result.concat(app.photos);
      };
    });
    result;
  };

  public func getAdminStats(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
  ) : Types.AdminStats {
    var total = 0;
    var approved = 0;
    var pending = 0;
    var rejected = 0;
    applications.values().forEach(func(app) {
      total += 1;
      switch (app.status) {
        case (#approved) { approved += 1 };
        case (#pending) { pending += 1 };
        case (#rejected) { rejected += 1 };
      };
    });
    { total; approved; pending; rejected };
  };

  public func resendApprovalEmail<system>(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : async { #ok; #err : Text } {
    switch (applications.get(id)) {
      case null { #err("Application not found") };
      case (?app) {
        if (app.status != #approved) {
          return #err("Application is not approved");
        };
        let token = switch (app.qrToken) {
          case (?t) t;
          case null {
            let t = generateQrToken(id);
            applications.add(id, { app with qrToken = ?t });
            t;
          };
        };
        let qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" # token;
        let appIdFormatted = "#" # id.toText();
        let htmlBody = "<html><body style='font-family:sans-serif;background:#0a0a0a;color:#fff;padding:32px'>"
          # "<h1 style='color:#d4af37'>You're In &#8212; 10s Only</h1>"
          # "<p>Hey " # app.name # ",</p>"
          # "<p>Your application has been <strong>approved</strong>!</p>"
          # "<p style='font-size:20px;margin:16px 0'>Application ID: <strong style='color:#d4af37'>" # appIdFormatted # "</strong></p>"
          # "<p>Present this QR code at the door:</p>"
          # "<img src='" # qrUrl # "' alt='Entry QR Code' style='border:4px solid #d4af37'/>"
          # "<p style='margin-top:24px;color:#aaa'>See you on the dance floor.</p>"
          # "<p style='color:#ccc;font-size:14px;margin-top:16px;'>The exact address will be disclosed soon on your WhatsApp number. Stay tuned.</p>"
          # "</body></html>";
        let result = await Email.sendServiceEmail("", [app.email], "Your Entry Ticket &#8212; 10s Only", htmlBody);
        switch (result) {
          case (#err(e)) {
            Debug.print("[Email] Resend approval email failed for app " # id.toText() # ": " # e);
            #err("Failed to send email: " # e);
          };
          case (#ok) { #ok };
        };
      };
    };
  };

  public func broadcastToApprovedGuests<system>(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    subject : Text,
    message : Text,
  ) : async { #ok : Nat; #err : Text } {
    let htmlBody = "<html><body style='font-family:sans-serif;background:#0a0a0a;color:#fff;padding:32px'>"
      # "<h1 style='color:#d4af37'>10s Only</h1>"
      # "<div style='font-size:16px;line-height:1.7;'>" # message # "</div>"
      # "<p style='margin-top:32px;color:#aaa;font-size:14px;'>&#8212; The 10s Only Team</p>"
      # "</body></html>";
    let approvedApps = applications.values().filter(func(a : Types.Application) : Bool { a.status == #approved }).toArray(
      
    );
    var count = 0;
    for (app in approvedApps.vals()) {
      let result = await Email.sendServiceEmail("", [app.email], subject, htmlBody);
      switch (result) {
        case (#err(e)) {
          Debug.print("[Email] Broadcast failed for app " # app.id.toText() # ": " # e);
        };
        case (#ok) { count += 1 };
      };
    };
    #ok(count);
  };

  public func validateInviteCode(
    inviteCodes : Map.Map<Text, Bool>,
    code : Text,
  ) : Bool {
    switch (inviteCodes.get(code)) {
      case (?true) true;
      case _ false;
    };
  };

  public func addInviteCode(
    inviteCodes : Map.Map<Text, Bool>,
    code : Text,
  ) : () {
    inviteCodes.add(code, true);
  };

  public func generateQrToken(id : Common.ApplicationId) : Text {
    "QR-" # id.toText() # "-" # Time.now().toText();
  };
};
