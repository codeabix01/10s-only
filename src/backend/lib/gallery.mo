import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import GalleryTypes "../types/gallery";
import Storage "mo:caffeineai-object-storage/Storage";
import UserApproval "mo:caffeineai-user-approval/approval";
import AppTypes "../types/application";
import Common "../types/common";
import UserTypes "../types/user";

module {
  /// Determine whether the given principal has been approved via UserApproval state.
  public func isApprovedMember(
    approvalState : UserApproval.UserApprovalState,
    caller : Principal,
  ) : Bool {
    UserApproval.isApproved(approvalState, caller);
  };

  /// Fallback: check if the caller has an application with status #approved.
  /// This covers users approved before the UserApproval sync was introduced.
  public func hasApprovedApplication(
    applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
    caller : Principal,
  ) : Bool {
    switch (
      applications.values().find(func(app : AppTypes.Application) : Bool {
        switch (app.applicantPrincipal) {
          case (?p) { p == caller and app.status == #approved };
          case null { false };
        };
      })
    ) {
      case (?_) { true };
      case null { false };
    };
  };

  /// Session-based approval check: given a session token, look up the user
  /// and verify their linked application has status #approved.
  public func isApprovedViaSession(
    users : Map.Map<Nat, UserTypes.User>,
    applications : Map.Map<Common.ApplicationId, AppTypes.Application>,
    token : Text,
  ) : Bool {
    // Find user with matching sessionToken
    let maybeUser = users.entries().find(func((_, u) : (Nat, UserTypes.User)) : Bool {
      u.sessionToken == ?token
    });
    switch maybeUser {
      case null { false };
      case (?(_, user)) {
        // Try linkedApplicationId first
        let maybeApp : ?AppTypes.Application = switch (user.linkedApplicationId) {
          case (?idText) {
            switch (Nat.fromText(idText)) {
              case (?natId) { applications.get(natId) };
              case null { null };
            };
          };
          case null { null };
        };
        // Fall back: search by email or phone
        let app : ?AppTypes.Application = switch maybeApp {
          case (?a) { ?a };
          case null {
            applications.entries().find(func((_, a) : (Common.ApplicationId, AppTypes.Application)) : Bool {
              a.email == user.emailOrPhone or a.phone == user.emailOrPhone
            }).map<(Common.ApplicationId, AppTypes.Application), AppTypes.Application>(func((_, a)) { a });
          };
        };
        switch app {
          case null { false };
          case (?a) { a.status == #approved };
        };
      };
    };
  };

  /// Generate a unique gallery upload id.
  public func generateUploadId(state : { var nextGalleryId : Nat }) : GalleryTypes.GalleryUploadId {
    state.nextGalleryId += 1;
    "gallery-" # state.nextGalleryId.toText() # "-" # Time.now().toText();
  };

  /// Store a new gallery upload (approved = false by default).
  public func storeUpload(
    galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
    state : { var nextGalleryId : Nat },
    caller : Principal,
    photo : Storage.ExternalBlob,
    caption : ?Text,
  ) : GalleryTypes.GalleryUploadId {
    let id = generateUploadId(state);
    let upload : GalleryTypes.GalleryUpload = {
      id;
      uploaderPrincipal = caller;
      caption;
      photo;
      uploadedAt = Time.now();
      approved = true;
    };
    galleryUploads.add(id, upload);
    id;
  };

  /// Return only admin-approved uploads.
  public func getPublicUploads(
    galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
  ) : [GalleryTypes.GalleryUpload] {
    galleryUploads.values().filter(func(u : GalleryTypes.GalleryUpload) : Bool { u.approved }).toArray();
  };

  /// Return all uploads (admin view).
  public func getAllUploads(
    galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
  ) : [GalleryTypes.GalleryUpload] {
    galleryUploads.values().toArray();
  };

  /// Set approved = true for the given upload.
  public func approveUpload(
    galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
    id : GalleryTypes.GalleryUploadId,
  ) : { #ok; #err : Text } {
    switch (galleryUploads.get(id)) {
      case null { #err("Upload not found: " # id) };
      case (?upload) {
        galleryUploads.add(id, { upload with approved = true });
        #ok;
      };
    };
  };

  /// Remove the given upload.
  public func rejectUpload(
    galleryUploads : Map.Map<GalleryTypes.GalleryUploadId, GalleryTypes.GalleryUpload>,
    id : GalleryTypes.GalleryUploadId,
  ) : { #ok; #err : Text } {
    switch (galleryUploads.get(id)) {
      case null { #err("Upload not found: " # id) };
      case _ {
        galleryUploads.remove(id);
        #ok;
      };
    };
  };
};
