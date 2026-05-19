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

module {
  func toView(app : Types.Application) : Types.ApplicationView {
    { app with id = app.id };
  };

  public func submitApplication(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    inviteCodes : Map.Map<Text, Bool>,
    state : { var nextId : Nat },
    input : Types.ApplicationInput,
  ) : Common.ApplicationId {
    if (not validateInviteCode(inviteCodes, input.inviteCode)) {
      Runtime.trap("Invalid invite code");
    };
    let duplicate = applications.values().find(func(app) {
      app.email == input.email and (app.status == #approved or app.status == #pending)
    });
    switch (duplicate) {
      case (?_) { Runtime.trap("An application with this email is already pending or approved") };
      case null {};
    };
    let id = state.nextId;
    state.nextId += 1;
    let application : Types.Application = {
      id;
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

  public func approveApplication(
    applications : Map.Map<Common.ApplicationId, Types.Application>,
    id : Common.ApplicationId,
  ) : () {
    switch (applications.get(id)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        let token = generateQrToken(id);
        applications.add(id, { app with status = #approved; qrToken = ?token });
      };
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
