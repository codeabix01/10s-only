import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import UserTypes "../types/user";
import Map "mo:core/Map";

mixin (
  accessControlState : AccessControl.AccessControlState,
  users : Map.Map<Nat, UserTypes.User>,
) {
  // List all registered user profiles — admin only
  public query ({ caller }) func getRegisteredUsers() : async [UserTypes.UserProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view registered users");
    };
    users.entries().map<(Nat, UserTypes.User), UserTypes.UserProfile>(func((_, u)) {
      {
        id = u.id;
        name = u.name;
        emailOrPhone = u.emailOrPhone;
        linkedApplicationId = u.linkedApplicationId;
        createdAt = u.createdAt;
        gender = u.gender;
        instagramHandle = u.instagramHandle;
        bio = u.bio;
        city = u.city;
        profilePhoto = u.profilePhoto;
        profileCompleted = u.profileCompleted;
      }
    }).toArray();
  };

  // Delete a user account by their emailOrPhone — admin only
  public shared ({ caller }) func deleteUser(emailOrPhone : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      return #err("Unauthorized: Only admins can delete users");
    };
    let found = users.entries().find(func((_, u)) { u.emailOrPhone == emailOrPhone });
    switch (found) {
      case null { #err("User not found: " # emailOrPhone) };
      case (?(id, _)) {
        users.remove(id);
        #ok;
      };
    };
  };

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
