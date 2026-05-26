import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import Storage "mo:caffeineai-object-storage/Storage";
import UserApproval "mo:caffeineai-user-approval/approval";
import GalleryTypes "../types/gallery";
import GalleryLib "../lib/gallery";
import AppTypes "../types/application";
import Common "../types/common";
import Nat "mo:core/Nat";
import UserTypes "../types/user";

mixin (
  accessControlState : AccessControl.AccessControlState,
  approvalState : UserApproval.UserApprovalState,
  applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
  galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
  galleryState : { var nextGalleryId : Nat },
  users : Map.Map<Nat, UserTypes.User>,
) {
  /// Upload a party photo — only callable by approved members.
  /// Stored with approved = true so it appears in gallery after upload.
  public shared ({ caller }) func uploadGalleryPhoto(
    photo : Storage.ExternalBlob,
    caption : ?Text,
    sessionToken : ?Text,
  ) : async { #ok : Text; #err : Text } {
    // Check 1: UserApproval state (for Internet Identity users)
    let approvedViaState = GalleryLib.isApprovedMember(approvalState, caller);
    // Check 2: approved application linked to this principal
    let approvedViaApp = GalleryLib.hasApprovedApplication(applications, caller);
    // Check 3: session token (for email/password users whose principal is always anonymous)
    let approvedViaSession = switch sessionToken {
      case null { false };
      case (?token) { GalleryLib.isApprovedViaSession(users, applications, token) };
    };
    if (not approvedViaState and not approvedViaApp and not approvedViaSession) {
      return #err("Only approved members can upload");
    };
    let uploadId = GalleryLib.storeUpload(galleryUploads, galleryState, caller, photo, caption);
    #ok(uploadId);
  };

  /// Returns only admin-approved gallery uploads — callable by anyone.
  public query func getPublicGalleryPhotos() : async [GalleryTypes.GalleryUpload] {
    GalleryLib.getPublicUploads(galleryUploads);
  };

  /// Returns all gallery uploads including unapproved — admin only.
  public query ({ caller }) func adminGetAllGalleryPhotos() : async [GalleryTypes.GalleryUpload] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all gallery photos");
    };
    GalleryLib.getAllUploads(galleryUploads);
  };

  /// Admin approves a gallery photo so it becomes publicly visible.
  public shared ({ caller }) func adminApproveGalleryPhoto(id : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve gallery photos");
    };
    GalleryLib.approveUpload(galleryUploads, id);
  };

  /// Admin rejects/removes a gallery photo.
  public shared ({ caller }) func adminRejectGalleryPhoto(id : Text) : async { #ok; #err : Text } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject gallery photos");
    };
    GalleryLib.rejectUpload(galleryUploads, id);
  };
};
