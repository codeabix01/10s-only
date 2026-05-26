import Nat "mo:core/Nat";

module {
  public type Timestamp = Int;
  public type ApplicationId = Nat;

  /// Parse a Text into an ApplicationId (Nat). Returns null if unparseable.
  public func textToApplicationId(t : Text) : ?ApplicationId {
    Nat.fromText(t);
  };
};
