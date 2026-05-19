module {
  public type QuizOption = {
    id : Nat;
    text : Text;
  };

  public type QuizQuestion = {
    id : Nat;
    text : Text;
    options : [QuizOption];
  };

  public type QuizResult = {
    resultType : Text;
    description : Text;
  };

  public type GuestQuizResult = {
    applicationId : Nat;
    resultType : Text;
    takenAt : Int;
  };
};
