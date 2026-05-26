import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import UserTypes "../types/user";
import AppTypes "../types/application";
import Common "../types/common";
import Nat "mo:core/Nat";

mixin (
  users : Map.Map<Nat, UserTypes.User>,
  userState : { var nextUserId : Nat },
  applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
) {
  // --- helpers ---

  func hashPassword(emailOrPhone : Text, password : Text) : Text {
    emailOrPhone # "::" # password # "::10sonly_salt";
  };

  func generateToken(emailOrPhone : Text) : Text {
    emailOrPhone # "_" # Time.now().toText();
  };

  func toProfile(u : UserTypes.User) : UserTypes.UserProfile {
    {
      id = u.id;
      name = u.name;
      emailOrPhone = u.emailOrPhone;
      linkedApplicationId = u.linkedApplicationId;
      createdAt = u.createdAt;
      gender = u.gender;
      instagramHandle = u.instagramHandle;
      bio = u.bio;
      city = u.city;
      profilePhoto = u.profilePhoto;
      profileCompleted = u.profileCompleted;
    };
  };

  func findUserByToken(token : Text) : ?UserTypes.User {
    users.entries().find(func((_, u)) { u.sessionToken == ?token }).map<(Nat, UserTypes.User), UserTypes.User>(func((_, u)) { u });
  };

  func findUserByEmailOrPhone(emailOrPhone : Text) : ?UserTypes.User {
    users.entries().find(func((_, u)) { u.emailOrPhone == emailOrPhone }).map<(Nat, UserTypes.User), UserTypes.User>(func((_, u)) { u });
  };

  // --- public API ---

  public query func getTotalUserCount() : async Nat {
    users.size();
  };

  public shared func signUp(input : UserTypes.UserSignUpInput) : async { #ok : UserTypes.UserProfile; #err : Text } {
    if (input.emailOrPhone == "") {
      return #err("Email or phone is required");
    };
    if (input.password.size() < 6) {
      return #err("Password must be at least 6 characters");
    };
    // Only block sign-up if the email is already a registered USER ACCOUNT.
    // If the email exists only as an application (no user account), allow sign-up
    // and automatically link the existing application.
    switch (findUserByEmailOrPhone(input.emailOrPhone)) {
      case (?_) { return #err("An account with this email or phone already exists") };
      case null {};
    };
    let id = userState.nextUserId;
    userState.nextUserId += 1;
    let token = generateToken(input.emailOrPhone);
    let allSet = input.instagramHandle != null and input.bio != null and input.gender != null;
    // Auto-link any existing application for this email/phone
    let existingAppId : ?Text = applications.entries().find(
      func((_, a)) { a.email == input.emailOrPhone or a.phone == input.emailOrPhone }
    ).map<(Common.ApplicationId, AppTypes.Application), Text>(func((k, _)) { k.toText() });
    let user : UserTypes.User = {
      id;
      var name = input.name;
      emailOrPhone = input.emailOrPhone;
      passwordHash = hashPassword(input.emailOrPhone, input.password);
      var sessionToken = ?token;
      var linkedApplicationId = existingAppId;
      createdAt = Time.now();
      var gender = input.gender;
      var instagramHandle = input.instagramHandle;
      var bio = input.bio;
      var city = input.city;
      var profilePhoto = input.profilePhoto;
      var profileCompleted = if (allSet) { ?true } else { null };
    };
    users.add(id, user);
    #ok(toProfile(user));
  };

  public shared func updateUserProfile(token : Text, input : UserTypes.UpdateProfileInput) : async { #ok : UserTypes.UserProfile; #err : Text } {
    switch (findUserByToken(token)) {
      case null { #err("Invalid session") };
      case (?user) {
        switch (input.name) { case (?v) { user.name := v }; case null {} };
        switch (input.instagramHandle) { case (?v) { user.instagramHandle := ?v }; case null {} };
        switch (input.bio) { case (?v) { user.bio := ?v }; case null {} };
        switch (input.gender) { case (?v) { user.gender := ?v }; case null {} };
        switch (input.city) { case (?v) { user.city := ?v }; case null {} };
        switch (input.profilePhoto) { case (?v) { user.profilePhoto := ?v }; case null {} };
        let completed = user.instagramHandle != null and user.bio != null and user.gender != null;
        if (completed) { user.profileCompleted := ?true };
        #ok(toProfile(user));
      };
    };
  };

  public shared func login(input : UserTypes.UserLoginInput) : async { #ok : UserTypes.UserSessionResult; #err : Text } {
    switch (findUserByEmailOrPhone(input.emailOrPhone)) {
      case null { #err("No account found with this email or phone") };
      case (?user) {
        let expected = hashPassword(input.emailOrPhone, input.password);
        if (user.passwordHash != expected) {
          return #err("Incorrect password");
        };
        let token = generateToken(input.emailOrPhone);
        user.sessionToken := ?token;
        #ok({ token; user = toProfile(user) });
      };
    };
  };

  public shared func verifySession(token : Text) : async { #ok : UserTypes.UserProfile; #err : Text } {
    switch (findUserByToken(token)) {
      case null { #err("Invalid session") };
      case (?user) { #ok(toProfile(user)) };
    };
  };

  public shared func logout(token : Text) : async { #ok; #err : Text } {
    switch (findUserByToken(token)) {
      case null { #err("Invalid session") };
      case (?user) {
        user.sessionToken := null;
        #ok;
      };
    };
  };

  public shared func getUserProfile(token : Text) : async { #ok : UserTypes.UserProfile; #err : Text } {
    switch (findUserByToken(token)) {
      case null { #err("Invalid session") };
      case (?user) { #ok(toProfile(user)) };
    };
  };

  public shared func linkApplicationToUser(token : Text, applicationId : Text) : async { #ok; #err : Text } {
    switch (findUserByToken(token)) {
      case null { #err("Invalid session") };
      case (?user) {
        user.linkedApplicationId := ?applicationId;
        #ok;
      };
    };
  };

  public shared func getUserApplicationStatus(token : Text) : async { #ok : AppTypes.ApplicationView; #err : Text } {
    switch (findUserByToken(token)) {
      case null { return #err("Invalid session") };
      case (?user) {
        // Try linked application ID first
        let maybeApp : ?AppTypes.Application = switch (user.linkedApplicationId) {
          case (?idText) {
            switch (Nat.fromText(idText)) {
              case (?natId) { applications.get(natId) };
              case null { null };
            };
          };
          case null { null };
        };
        // Fall back: search by email or phone
        let app : ?AppTypes.Application = switch maybeApp {
          case (?a) { ?a };
          case null {
            applications.entries().find(func((_, a)) {
              a.email == user.emailOrPhone or a.phone == user.emailOrPhone
            }).map<(Common.ApplicationId, AppTypes.Application), AppTypes.Application>(func((_, a)) { a });
          };
        };
        switch app {
          case null { #err("No application found for this account") };
          case (?a) {
            #ok({
              id = a.id;
              name = a.name;
              instagramHandle = a.instagramHandle;
              email = a.email;
              phone = a.phone;
              inviteCode = a.inviteCode;
              plusOne = a.plusOne;
              photos = a.photos;
              status = a.status;
              submittedAt = a.submittedAt;
              qrToken = a.qrToken;
              applicantPrincipal = a.applicantPrincipal;
            });
          };
        };
      };
    };
  };
};
