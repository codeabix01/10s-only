import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";

mixin (
  accessControlState : AccessControl.AccessControlState,
) {
  // Add a new admin — only existing admins can call this
  public shared ({ caller }) func addAdmin(principal : Principal) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: Only admins can add admins");
    };
    if (principal.isAnonymous()) {
      return #err("Cannot add anonymous principal as admin");
    };
    // assignRole will overwrite whatever role they have (or create a new entry)
    accessControlState.userRoles.add(principal, #admin);
    #ok;
  };

  // Remove an admin — only existing admins can call this
  // Cannot remove yourself if you are the last admin
  public shared ({ caller }) func removeAdmin(principal : Principal) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: Only admins can remove admins");
    };
    // Count current admins
    let adminCount = accessControlState.userRoles.entries().filter(
      func((_, role)) { role == #admin }
    ).size();
    if (adminCount <= 1 and principal == caller) {
      return #err("Cannot remove yourself — you are the last admin");
    };
    // Downgrade to #user (keep them registered, just no longer admin)
    accessControlState.userRoles.add(principal, #user);
    #ok;
  };

  // List all admin principals — only admins can call this
  public query ({ caller }) func listAdmins() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list admins");
    };
    accessControlState.userRoles.entries()
      .filter(func((_, role)) { role == #admin })
      .map(func((p, _)) { p })
      .toArray();
  };
};
