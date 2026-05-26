import { createActor } from "@/backend";
import { ExternalBlob } from "@/backend";
import type { Gender, UpdateProfileInput } from "@/backend";
import { useUserAuth } from "@/hooks/useUserAuth";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const REQUIRED_FIELDS = ["name", "instagram", "bio", "gender"] as const;

function calcProgress(
  name: string,
  instagram: string,
  bio: string,
  gender: string,
): number {
  let filled = 0;
  if (name.trim()) filled++;
  if (instagram.trim()) filled++;
  if (bio.trim()) filled++;
  if (gender) filled++;
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

function bytesToDataURL(bytes: Uint8Array, contentType: string): string {
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

async function compressImage(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const buffer = await blob.arrayBuffer();
          resolve(new Uint8Array(buffer));
        },
        "image/jpeg",
        0.7,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function ProfileSetupPage() {
  const { userProfile, sessionToken } = useUserAuth();
  const { actor } = useActor(createActor);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [city, setCity] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from existing profile
  useEffect(() => {
    if (!userProfile) return;
    setName(userProfile.name || "");
    setInstagram(userProfile.instagramHandle || "");
    setBio(userProfile.bio || "");
    setCity(userProfile.city || "");
    if (userProfile.gender) {
      const g = userProfile.gender as unknown as string;
      if (g === "male" || g === "female" || g === "other") setGender(g);
    }
    if (userProfile.profilePhoto) setPhotoPreview(userProfile.profilePhoto);
  }, [userProfile]);

  // Redirect if not logged in
  useEffect(() => {
    if (userProfile === null && sessionToken === null) {
      navigate({ to: "/login" });
    }
  }, [userProfile, sessionToken, navigate]);

  const progress = calcProgress(name, instagram, bio, gender);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large. Max 10MB.");
      return;
    }
    setPhotoFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || !sessionToken) return;
    setError(null);
    setIsSubmitting(true);

    try {
      let photoBytes: Uint8Array | undefined;

      if (photoFile) {
        photoBytes = await compressImage(photoFile);
      }

      const genderMap: Record<"male" | "female" | "other", Gender> = {
        male: "male" as unknown as Gender,
        female: "female" as unknown as Gender,
        other: "other" as unknown as Gender,
      };

      const input: UpdateProfileInput = {
        name: name.trim() || undefined,
        instagramHandle: instagram.trim() || undefined,
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        gender: gender?.trim()
          ? genderMap[gender as "male" | "female" | "other"]
          : undefined,
        profilePhoto: photoBytes
          ? bytesToDataURL(photoBytes, "image/jpeg")
          : undefined,
      };

      const result = await actor.updateUserProfile(sessionToken, input);
      if (result.__kind__ === "err") throw new Error(result.err);

      setDone(true);
      setTimeout(() => {
        // Navigate based on application status
        const linked = result.ok.linkedApplicationId;
        if (linked) {
          navigate({ to: "/portal" });
        } else {
          navigate({ to: "/status" });
        }
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div
          className="flex flex-col items-center gap-4 page-transition-in"
          data-ocid="profile.success_state"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305))",
              boxShadow: "0 0 32px oklch(0.65 0.22 290 / 0.5)",
            }}
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="font-display font-bold text-xl text-foreground">
            Identity Locked In
          </p>
          <p className="text-sm text-muted-foreground font-body">
            Taking you inside…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Neon blobs */}
      <div className="neon-blob neon-blob--purple" />
      <div className="neon-blob neon-blob--magenta" />
      <div className="neon-blob neon-blob--cyan" />

      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div
        className="relative z-10 w-full max-w-md"
        data-ocid="profile.setup.card"
      >
        <div className="glass-card-elevated rounded-2xl p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Step 1 of 2
            </p>
            <h1 className="text-2xl font-display font-black text-foreground">
              Build Your{" "}
              <span
                className="relative"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Identity
              </span>
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">
              Tell us who you are. Make it count.
            </p>
          </div>

          {/* Progress bar */}
          <div data-ocid="profile.progress">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Profile strength
              </span>
              <span
                className="text-xs font-mono font-bold"
                style={{
                  color:
                    progress >= 100
                      ? "oklch(0.75 0.18 145)"
                      : progress >= 50
                        ? "oklch(0.75 0.18 80)"
                        : "oklch(0.65 0.22 290)",
                }}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305), oklch(0.7 0.2 200))",
                  boxShadow: "0 0 8px oklch(0.65 0.22 290 / 0.5)",
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="profile.photo.upload_button"
                className="relative group"
                aria-label="Upload profile photo"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:ring-2"
                  style={{
                    background: photoPreview
                      ? "transparent"
                      : "oklch(0.2 0.05 290 / 0.5)",
                    border: photoPreview
                      ? "2px solid oklch(0.65 0.22 290 / 0.5)"
                      : "2px dashed oklch(0.65 0.22 290 / 0.35)",
                    opacity: photoPreview ? 1 : 0.7,
                  }}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera
                      className="w-7 h-7"
                      style={{ color: "oklch(0.65 0.22 290)" }}
                    />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                data-ocid="profile.photo.input"
              />
              <p
                className="text-xs font-body"
                style={{
                  color: photoPreview
                    ? "oklch(0.75 0.18 145)"
                    : "oklch(0.5 0 0)",
                }}
              >
                {photoPreview
                  ? "Looking good ✓"
                  : "Add photo (optional — but it helps)"}
              </p>
            </div>

            {/* Name */}
            <ProfileInput
              id="profile-name"
              label="Your Name *"
              value={name}
              onChange={setName}
              ocid="profile.name_input"
            />

            {/* Instagram */}
            <div className="relative">
              <ProfileInput
                id="profile-instagram"
                label="Instagram Handle *"
                value={instagram}
                onChange={setInstagram}
                prefix="@"
                ocid="profile.instagram_input"
              />
            </div>

            {/* Bio */}
            <div>
              <div className="relative">
                <label
                  htmlFor="profile-bio"
                  className="absolute left-4 top-3 text-xs font-body pointer-events-none z-10"
                  style={{ color: "oklch(0.55 0 0)" }}
                >
                  Short Bio *{" "}
                  <span className="text-muted-foreground/50">
                    (who are you?)
                  </span>
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 120))}
                  rows={3}
                  placeholder=""
                  maxLength={120}
                  data-ocid="profile.bio_textarea"
                  className="glass-input w-full pt-8 pb-2 px-4 text-foreground font-body text-sm outline-none resize-none"
                />
              </div>
              <div className="flex justify-end mt-1">
                <span
                  className="text-xs font-mono"
                  style={{
                    color:
                      bio.length >= 110
                        ? "oklch(0.65 0.22 25)"
                        : "oklch(0.45 0 0)",
                  }}
                >
                  {bio.length}/120
                </span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <p
                className="text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Gender *
              </p>
              <div className="flex gap-2" data-ocid="profile.gender_select">
                {(["male", "female", "other"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    data-ocid={`profile.gender.${g}`}
                    className="flex-1 py-2.5 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background:
                        gender === g
                          ? g === "male"
                            ? "oklch(0.7 0.2 200 / 0.25)"
                            : g === "female"
                              ? "oklch(0.68 0.27 305 / 0.25)"
                              : "oklch(0.65 0.22 290 / 0.25)"
                          : "oklch(0.15 0.02 290 / 0.4)",
                      border:
                        gender === g
                          ? g === "male"
                            ? "1.5px solid oklch(0.7 0.2 200 / 0.7)"
                            : g === "female"
                              ? "1.5px solid oklch(0.68 0.27 305 / 0.7)"
                              : "1.5px solid oklch(0.65 0.22 290 / 0.7)"
                          : "1.5px solid oklch(0.3 0 0 / 0.4)",
                      color:
                        gender === g
                          ? g === "male"
                            ? "oklch(0.7 0.2 200)"
                            : g === "female"
                              ? "oklch(0.68 0.27 305)"
                              : "oklch(0.65 0.22 290)"
                          : "oklch(0.5 0 0)",
                      boxShadow:
                        gender === g
                          ? g === "male"
                            ? "0 0 12px oklch(0.7 0.2 200 / 0.3)"
                            : g === "female"
                              ? "0 0 12px oklch(0.68 0.27 305 / 0.3)"
                              : "0 0 12px oklch(0.65 0.22 290 / 0.3)"
                          : "none",
                    }}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* City (optional) */}
            <ProfileInput
              id="profile-city"
              label="Where are you from? (optional)"
              value={city}
              onChange={setCity}
              ocid="profile.city_input"
            />

            {/* Error */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-body text-red-300 border border-red-500/30"
                style={{ background: "oklch(0.4 0.15 25 / 0.18)" }}
                data-ocid="profile.error_state"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              data-ocid="profile.submit_button"
              className="glass-button w-full py-4 text-foreground font-display font-bold tracking-[0.2em] uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Locking In…
                </>
              ) : (
                "Lock In My Identity"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function ProfileInput({
  id,
  label,
  value,
  onChange,
  prefix,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  ocid: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="absolute left-4 transition-all duration-200 pointer-events-none font-body"
        style={{
          top: lifted ? "8px" : "50%",
          transform: lifted ? "translateY(0) scale(0.75)" : "translateY(-50%)",
          transformOrigin: "left center",
          fontSize: lifted ? "0.75rem" : "0.875rem",
          color: focused ? "oklch(0.68 0.27 305)" : "oklch(0.55 0 0)",
          zIndex: 1,
        }}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 font-body text-sm font-bold pointer-events-none"
            style={{
              color: value ? "oklch(0.68 0.27 305)" : "oklch(0.45 0 0)",
              paddingTop: "10px",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          data-ocid={ocid}
          className="glass-input w-full pt-6 pb-2 px-4 text-foreground font-body text-sm outline-none"
          style={{ paddingLeft: prefix ? "1.75rem" : undefined }}
        />
      </div>
    </div>
  );
}
