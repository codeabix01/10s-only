module {
  public type UserId = Nat;

  public type Gender = { #male; #female; #other };

  public type User = {
    id : UserId;
    var name : Text;
    emailOrPhone : Text;
    passwordHash : Text;
    var sessionToken : ?Text;
    var linkedApplicationId : ?Text;
    createdAt : Int;
    var gender : ?Gender;
    var instagramHandle : ?Text;
    var bio : ?Text;
    var city : ?Text;
    var profilePhoto : ?Text;
    var profileCompleted : ?Bool;
  };

  public type UserSignUpInput = {
    name : Text;
    emailOrPhone : Text;
    password : Text;
    gender : ?Gender;
    instagramHandle : ?Text;
    bio : ?Text;
    city : ?Text;
    profilePhoto : ?Text;
  };

  public type UserLoginInput = {
    emailOrPhone : Text;
    password : Text;
  };

  public type UserProfile = {
    id : UserId;
    name : Text;
    emailOrPhone : Text;
    linkedApplicationId : ?Text;
    createdAt : Int;
    gender : ?Gender;
    instagramHandle : ?Text;
    bio : ?Text;
    city : ?Text;
    profilePhoto : ?Text;
    profileCompleted : ?Bool;
  };

  public type UserSessionResult = {
    token : Text;
    user : UserProfile;
  };

  public type UpdateProfileInput = {
    name : ?Text;
    instagramHandle : ?Text;
    bio : ?Text;
    gender : ?Gender;
    city : ?Text;
    profilePhoto : ?Text;
  };
};
