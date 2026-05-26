import List "mo:core/List";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Types "../types/confession";

module {
  public func submitConfession(
    confessions : List.List<Types.Confession>,
    state : { var nextConfessionId : Nat },
    text : Text,
    submittedBy : ?Text,
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
      submittedBy;
      createdAt = Time.now();
      approved = true;
    });
    id;
  };

  /// Returns only admin-approved confessions (public view — author hidden).
  public func listConfessions(
    confessions : List.List<Types.Confession>,
  ) : [Types.ConfessionView] {
    let arr = confessions.toArray();
    let approvedOnly = arr.filter(func(c : Types.Confession) : Bool { c.approved });
    let views = approvedOnly.map(
      func(c) { { id = c.id; text = c.text; createdAt = c.createdAt; approved = c.approved } }
    );
    views.reverse();
  };

  /// Returns ALL confessions including unapproved, with author info — admin only.
  public func adminListConfessions(
    confessions : List.List<Types.Confession>,
  ) : [Types.AdminConfessionView] {
    let arr = confessions.toArray();
    let views = arr.map(
      func(c) { { id = c.id; text = c.text; submittedBy = c.submittedBy; createdAt = c.createdAt; approved = c.approved } }
    );
    views.reverse();
  };

  /// Approve a confession so it becomes publicly visible.
  public func approveConfession(
    confessions : List.List<Types.Confession>,
    id : Nat,
  ) : { #ok; #err : Text } {
    var found = false;
    confessions.mapInPlace(
      func(c) {
        if (c.id == id) { found := true; { c with approved = true } } else { c }
      }
    );
    if (found) { #ok } else { #err("Confession not found: " # id.toText()) };
  };

  /// Delete a confession by id — removes it from the list.
  public func deleteConfession(
    confessions : List.List<Types.Confession>,
    id : Nat,
  ) : { #ok; #err : Text } {
    let before = confessions.size();
    let arr = confessions.toArray();
    let filtered = arr.filter(func(c : Types.Confession) : Bool { c.id != id });
    if (filtered.size() == before) {
      return #err("Confession not found: " # id.toText());
    };
    confessions.clear();
    for (item in filtered.values()) {
      confessions.add(item);
    };
    #ok;
  };
};
