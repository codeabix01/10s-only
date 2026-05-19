import Map "mo:core/Map";
import Storage "mo:caffeineai-object-storage/Storage";
import AppTypes "types/application";
import Common "types/common";

module {
  // Old Application type (before applicationId field was added)
  type OldApplicationStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type OldApplication = {
    id : Nat;
    name : Text;
    instagramHandle : Text;
    email : Text;
    phone : Text;
    inviteCode : Text;
    plusOne : ?Bool;
    photos : [Storage.ExternalBlob];
    status : OldApplicationStatus;
    submittedAt : Int;
    qrToken : ?Text;
  };

  type OldActor = {
    applications : Map.Map<Common.ApplicationId, OldApplication>;
    inviteCodes : Map.Map<Text, Bool>;
    appState : { var nextAppId : Nat };
  };

  type NewActor = {
    applications : Map.Map<Common.ApplicationId, AppTypes.Application>;
    inviteCodes : Map.Map<Text, Bool>;
    appState : { var nextAppId : Nat };
  };

  public func run(old : OldActor) : NewActor {
    let applications = old.applications.map<Common.ApplicationId, OldApplication, AppTypes.Application>(
      func(id, app) {
        { app with applicationId = "#" # id.toText() };
      }
    );
    {
      applications;
      inviteCodes = old.inviteCodes;
      appState = old.appState;
    };
  };
};
