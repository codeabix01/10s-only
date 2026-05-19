import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import UserApproval "mo:caffeineai-user-approval/approval";
import Runtime "mo:core/Runtime";
import QuizTypes "../types/quiz";
import Common "../types/common";
import QuizLib "../lib/quiz";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  quizQuestions : List.List<QuizTypes.QuizQuestion>,
  quizResults : Map.Map<Common.ApplicationId, QuizTypes.GuestQuizResult>,
) {
  // Hardcoded 6 questions initialized on first call (idempotent)
  func ensureQuestionsSeeded() {
    if (quizQuestions.size() == 0) {
      let q1 : QuizTypes.QuizQuestion = {
        id = 0;
        text = "The DJ drops an absolute banger. What's your move?";
        options = [
          { id = 0; text = "Immediately hit the dance floor and own it" },
          { id = 1; text = "Gather your crew and lead them to the floor" },
          { id = 2; text = "Do something unexpected that shocks everyone" },
          { id = 3; text = "Disappear then reappear looking flawless" },
        ];
      };
      let q2 : QuizTypes.QuizQuestion = {
        id = 1;
        text = "What's your pre-party ritual?";
        options = [
          { id = 0; text = "Spend 2 hours perfecting your look" },
          { id = 1; text = "Curate the pre-drinks playlist" },
          { id = 2; text = "Decide everything last-minute" },
          { id = 3; text = "Arrive fashionably late, no explanation needed" },
        ];
      };
      let q3 : QuizTypes.QuizQuestion = {
        id = 2;
        text = "Someone spills a drink on your outfit. You:";
        options = [
          { id = 0; text = "Make it part of the look — still serving" },
          { id = 1; text = "Laugh it off and keep the energy high" },
          { id = 2; text = "Turn it into the funniest moment of the night" },
          { id = 3; text = "Vanish and return in a completely different outfit" },
        ];
      };
      let q4 : QuizTypes.QuizQuestion = {
        id = 3;
        text = "What does the perfect night look like to you?";
        options = [
          { id = 0; text = "Everyone knows your name by midnight" },
          { id = 1; text = "You created memories for the whole group" },
          { id = 2; text = "Something wild and unplanned happened" },
          { id = 3; text = "You were everywhere but no one can quite explain it" },
        ];
      };
      let q5 : QuizTypes.QuizQuestion = {
        id = 4;
        text = "Your signature move on the dance floor is:";
        options = [
          { id = 0; text = "Perfectly on-beat, effortlessly cool" },
          { id = 1; text = "Getting everyone in a circle around you" },
          { id = 2; text = "Something nobody expected and can't stop talking about" },
          { id = 3; text = "A signature move no one else knows" },
        ];
      };
      let q6 : QuizTypes.QuizQuestion = {
        id = 5;
        text = "How do people describe you the morning after?";
        options = [
          { id = 0; text = "\"They were THAT person last night\"" },
          { id = 1; text = "\"They made the whole night for everyone\"" },
          { id = 2; text = "\"I have no idea what just happened but it was legendary\"" },
          { id = 3; text = "\"I saw them, then they were just... gone\"" },
        ];
      };
      quizQuestions.add(q1);
      quizQuestions.add(q2);
      quizQuestions.add(q3);
      quizQuestions.add(q4);
      quizQuestions.add(q5);
      quizQuestions.add(q6);
    };
  };

  public query func getQuizQuestions() : async [QuizTypes.QuizQuestion] {
    ensureQuestionsSeeded();
    QuizLib.listQuestions(quizQuestions);
  };

  public query func getQuizResultTypes() : async [QuizTypes.QuizResult] {
    QuizLib.getQuizResultTypes();
  };

  public shared ({ caller }) func submitQuizResult(applicationId : Common.ApplicationId, resultType : Text) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved guests can submit quiz results");
    };
    QuizLib.submitQuizResult(quizResults, applicationId, resultType);
  };

  public query ({ caller }) func getMyQuizResult(applicationId : Common.ApplicationId) : async ?QuizTypes.GuestQuizResult {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved guests can view quiz results");
    };
    QuizLib.getQuizResult(quizResults, applicationId);
  };
};
