import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type GalleryUploadId = Text;

  public type GalleryUpload = {
    id : GalleryUploadId;
    uploaderPrincipal : Principal;
    caption : ?Text;
    photo : Storage.ExternalBlob;
    uploadedAt : Int;
    approved : Bool;
  };
};
