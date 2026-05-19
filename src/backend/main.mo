import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import UserApproval "mo:caffeineai-user-approval/approval";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AppTypes "types/application";
import QuizTypes "types/quiz";
import ConfessionTypes "types/confession";
import Common "types/common";
import ApplicationMixin "mixins/application-api";
import QuizMixin "mixins/quiz-api";
import ConfessionMixin "mixins/confession-api";

actor {
  // Authorization & approval state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);

  // Object storage
  include MixinObjectStorage();

  // Application state
  let applications = Map.empty<Common.ApplicationId, AppTypes.Application>();
  let inviteCodes = Map.empty<Text, Bool>();
  let appState = { var nextAppId = 0 };

  include ApplicationMixin(accessControlState, applications, inviteCodes, appState);

  // Quiz state
  let quizQuestions = List.empty<QuizTypes.QuizQuestion>();
  let quizResults = Map.empty<Common.ApplicationId, QuizTypes.GuestQuizResult>();

  include QuizMixin(accessControlState, approvalState, quizQuestions, quizResults);

  // Confession state
  let confessions = List.empty<ConfessionTypes.Confession>();
  let confessionState = { var nextConfessionId = 0 };

  include ConfessionMixin(accessControlState, approvalState, confessions, confessionState);

  // User approval endpoints
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view approvals");
    };
    UserApproval.listApprovals(approvalState);
  };
};
