module {
  public type Confession = {
    id : Nat;
    text : Text;
    submittedBy : ?Text;  // author email/phone — stored internally, never exposed publicly
    createdAt : Int;
    approved : Bool;
  };

  public type ConfessionView = {
    id : Nat;
    text : Text;
    createdAt : Int;
    approved : Bool;
  };

  public type AdminConfessionView = {
    id : Nat;
    text : Text;
    submittedBy : ?Text;
    createdAt : Int;
    approved : Bool;
  };
};
