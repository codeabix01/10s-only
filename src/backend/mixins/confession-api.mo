import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Runtime "mo:core/Runtime";
import ConfessionTypes "../types/confession";
import ConfessionLib "../lib/confession";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  confessions : List.List<ConfessionTypes.Confession>,
  confessionState : { var nextConfessionId : Nat },
) {
  public shared ({ caller }) func submitConfession(text : Text) : async Nat {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved guests can submit confessions");
    };
    ConfessionLib.submitConfession(confessions, confessionState, text);
  };

  public query ({ caller }) func listConfessions() : async [ConfessionTypes.Confession] {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved guests can view confessions");
    };
    ConfessionLib.listConfessions(confessions);
  };
};
