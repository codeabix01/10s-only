import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Types "../types/confession";

module {
  public func submitConfession(
    confessions : List.List<Types.Confession>,
    state : { var nextConfessionId : Nat },
    text : Text,
  ) : Nat {
    let maxConfessions = 500;
    if (confessions.size() >= maxConfessions) {
      let arr = confessions.toArray();
      let trimmed = arr.sliceToArray(1, arr.size());
      confessions.clear();
      for (item in trimmed.values()) {
        confessions.add(item);
      };
    };
    let id = state.nextConfessionId;
    state.nextConfessionId += 1;
    confessions.add({
      id;
      text;
      createdAt = Time.now();
    });
    id;
  };

  public func listConfessions(
    confessions : List.List<Types.Confession>,
  ) : [Types.Confession] {
    let arr = confessions.toArray();
    arr.reverse();
  };
};
