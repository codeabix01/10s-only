import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/quiz";
import Common "../types/common";

module {
  public func listQuestions(
    questions : List.List<Types.QuizQuestion>,
  ) : [Types.QuizQuestion] {
    questions.toArray();
  };

  public func submitQuizResult(
    results : Map.Map<Common.ApplicationId, Types.GuestQuizResult>,
    applicationId : Common.ApplicationId,
    resultType : Text,
  ) : () {
    let result : Types.GuestQuizResult = {
      applicationId;
      resultType;
      takenAt = Time.now();
    };
    results.add(applicationId, result);
  };

  public func getQuizResult(
    results : Map.Map<Common.ApplicationId, Types.GuestQuizResult>,
    applicationId : Common.ApplicationId,
  ) : ?Types.GuestQuizResult {
    results.get(applicationId);
  };

  public func getQuizResultTypes() : [Types.QuizResult] {
    [
      { resultType = "The Icon"; description = "You walk in and the whole room knows it. Dripping in confidence, style on another level, you don't follow trends — you set them. The night revolves around your energy." },
      { resultType = "The Vibe Setter"; description = "No vibe exists until you bring it. You read the room, feel the music in your bones, and know exactly how to turn a good night into an unforgettable one. The DJ is playing for you." },
      { resultType = "The Wildcard"; description = "Nobody knows what you'll do next — not even you. Unpredictable, electric, magnetic. You make every night legendary just by showing up and doing whatever feels right." },
      { resultType = "The Phantom"; description = "Mysterious, elusive, always in the right place at the right time. You move through the night like a ghost — seen by few, remembered by everyone. The most exclusive person in the room." },
    ];
  };
};
