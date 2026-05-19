import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type ApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type Application = {
    id : Nat;
    name : Text;
    instagramHandle : Text;
    email : Text;
    phone : Text;
    inviteCode : Text;
    plusOne : Bool;
    photos : [Storage.ExternalBlob];
    status : ApplicationStatus;
    submittedAt : Int;
    qrToken : ?Text;
  };

  public type ApplicationInput = {
    name : Text;
    instagramHandle : Text;
    email : Text;
    phone : Text;
    inviteCode : Text;
    plusOne : Bool;
    photos : [Storage.ExternalBlob];
  };

  public type ApplicationView = {
    id : Nat;
    name : Text;
    instagramHandle : Text;
    email : Text;
    phone : Text;
    inviteCode : Text;
    plusOne : Bool;
    photos : [Storage.ExternalBlob];
    status : ApplicationStatus;
    submittedAt : Int;
    qrToken : ?Text;
  };

  public type AdminStats = {
    total : Nat;
    approved : Nat;
    pending : Nat;
    rejected : Nat;
  };
};
