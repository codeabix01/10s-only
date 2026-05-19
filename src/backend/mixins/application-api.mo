import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Runtime "mo:core/Runtime";
import AppTypes "../types/application";
import Common "../types/common";
import Storage "mo:caffeineai-object-storage/Storage";
import AppLib "../lib/application";

mixin (
  accessControlState : AccessControl.AccessControlState,
  applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
  inviteCodes : Map.Map<Text, Bool>,
  appState : { var nextAppId : Nat },
) {
  // Seed initial invite codes lazily (idempotent)
  do {
    let seeds = ["VIP2026", "TENS2026", "NEON2026", "RAVE2026", "ICONIC2026"];
    for (code in seeds.values()) {
      if (not AppLib.validateInviteCode(inviteCodes, code)) {
        AppLib.addInviteCode(inviteCodes, code);
      };
    };
  };
  public shared func submitApplication(input : AppTypes.ApplicationInput) : async Common.ApplicationId {
    AppLib.submitApplication(applications, inviteCodes, { var nextId = appState.nextAppId }, input);
  };

  public query func getApplicationStatus(id : Common.ApplicationId) : async ?(AppTypes.ApplicationStatus, ?Text) {
    AppLib.getGuestStatus(applications, id);
  };

  public shared ({ caller }) func approveApplication(id : Common.ApplicationId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve applications");
    };
    AppLib.approveApplication(applications, id);
  };

  public shared ({ caller }) func rejectApplication(id : Common.ApplicationId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject applications");
    };
    AppLib.rejectApplication(applications, id);
  };

  public query ({ caller }) func listApplications() : async [AppTypes.ApplicationView] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list applications");
    };
    AppLib.listApplications(applications);
  };

  public query ({ caller }) func getAdminStats() : async AppTypes.AdminStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };
    AppLib.getAdminStats(applications);
  };

  public query func getApprovedPhotos() : async [Storage.ExternalBlob] {
    AppLib.getApprovedPhotos(applications);
  };

  public shared ({ caller }) func addInviteCode(code : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add invite codes");
    };
    AppLib.addInviteCode(inviteCodes, code);
  };

  public query ({ caller }) func listInviteCodes() : async [Text] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list invite codes");
    };
    inviteCodes.keys().toArray();
  };
};
