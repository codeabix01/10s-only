import List "mo:core/List";
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Runtime "mo:core/Runtime";
import ConfessionTypes "../types/confession";
import ConfessionLib "../lib/confession";
import UserTypes "../types/user";
import AppTypes "../types/application";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  confessions : List.List<ConfessionTypes.Confession>,
  confessionState : { var nextConfessionId : Nat },
  users : Map.Map<Nat, UserTypes.User>,
  applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
) {
  /// Determine if a session token belongs to an approved applicant.
  func isSessionUserApproved(token : Text) : Bool {
    let maybeUser = users.entries().find(func((_, u)) { u.sessionToken == ?token })
      .map(func((_, u)) { u });
    switch (maybeUser) {
      case null { false };
      case (?user) {
        let maybeApp : ?AppTypes.Application = switch (user.linkedApplicationId) {
          case (?idText) {
            switch (Common.textToApplicationId(idText)) {
              case (?natId) { applications.get(natId) };
              case null { null };
            };
          };
          case null { null };
        };
        let app : ?AppTypes.Application = switch (maybeApp) {
          case (?a) { ?a };
          case null {
            applications.entries().find(func((_, a)) {
              a.email == user.emailOrPhone or a.phone == user.emailOrPhone
            }).map<(Common.ApplicationId, AppTypes.Application), AppTypes.Application>(func((_, a)) { a });
          };
        };
        switch (app) {
          case null { false };
          case (?a) { a.status == #approved };
        };
      };
    };
  };

  /// Submit a confession — requires an approved session token OR admin caller.
  public shared ({ caller }) func submitConfession(text : Text, sessionToken : ?Text) : async Nat {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    let isPrincipalApproved = UserApproval.isApproved(approvalState, caller);
    let isSessionApproved = switch (sessionToken) {
      case (?t) { isSessionUserApproved(t) };
      case null { false };
    };
    if (not (isAdmin or isPrincipalApproved or isSessionApproved)) {
      Runtime.trap("Unauthorized: Only approved guests can submit confessions");
    };
    let submittedBy : ?Text = switch (sessionToken) {
      case (?t) {
        users.entries().find(func((_, u)) { u.sessionToken == ?t })
          .map<(Nat, UserTypes.User), Text>(func((_, u)) { u.emailOrPhone });
      };
      case null { null };
    };
    ConfessionLib.submitConfession(confessions, confessionState, text, submittedBy);
  };

  /// List publicly approved confessions — requires approved session OR admin caller.
  public query ({ caller }) func listConfessions(sessionToken : ?Text) : async [ConfessionTypes.ConfessionView] {
    let isAdmin = AccessControl.hasPermission(accessControlState, caller, #admin);
    let isPrincipalApproved = UserApproval.isApproved(approvalState, caller);
    let isSessionApproved = switch (sessionToken) {
      case (?t) { isSessionUserApproved(t) };
      case null { false };
    };
    if (not (isAdmin or isPrincipalApproved or isSessionApproved)) {
      Runtime.trap("Unauthorized: Only approved guests can view confessions");
    };
    ConfessionLib.listConfessions(confessions);
  };

  /// Admin: list ALL confessions including unapproved, with author info.
  public query ({ caller }) func adminListConfessions() : async [ConfessionTypes.AdminConfessionView] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can list all confessions");
    };
    ConfessionLib.adminListConfessions(confessions);
  };

  /// Admin: approve a pending confession so it becomes publicly visible.
  public shared ({ caller }) func adminApproveConfession(id : Nat) : async { #ok; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can approve confessions");
    };
    ConfessionLib.approveConfession(confessions, id);
  };

  /// Admin: delete any confession by id.
  public shared ({ caller }) func adminDeleteConfession(id : Nat) : async { #ok; #err : Text } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return #err("Unauthorized: Only admins can delete confessions");
    };
    ConfessionLib.deleteConfession(confessions, id);
  };
};
