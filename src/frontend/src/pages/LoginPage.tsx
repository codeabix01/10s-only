import { WelcomeTransition } from "@/components/WelcomeTransition";
import { useUserAuth } from "@/hooks/useUserAuth";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Tab = "signin" | "signup";

function getPasswordStrength(pw: string): {
  label: string;
  score: number;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", score, color: "" };
  if (score <= 3) return { label: "Medium", score, color: "" };
  return { label: "Strong", score, color: "" };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [showPw, setShowPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [successState, setSuccessState] = useState<{
    name: string;
    mode: "login" | "signup";
  } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const pendingUserProfile = useRef<{ profileCompleted?: boolean } | null>(
    null,
  );

  // Sign in form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPw, setSignInPw] = useState("");

  // Sign up form
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPw, setSignUpPw] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, signUp, userProfile } = useUserAuth();
  const navigate = useNavigate();
  const redirected = useRef(false);

  // If already logged in without going through the form, redirect
  useEffect(() => {
    if (userProfile && !redirected.current && !showWelcome && !successState) {
      redirected.current = true;
      if (!userProfile.profileCompleted) {
        navigate({ to: "/profile-setup" });
      } else {
        navigate({ to: "/status" });
      }
    }
  }, [userProfile, navigate, showWelcome, successState]);

  const pwStrength = getPasswordStrength(signUpPw);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await login(signInEmail, signInPw);
      setSuccessState({
        name: signInEmail.split("@")[0] || signInEmail,
        mode: "login",
      });
      setShowWelcome(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Login failed");
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signUp(signUpName, signUpEmail, signUpPw);
      setSuccessState({ name: signUpName, mode: "signup" });
      setShowWelcome(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign up failed");
      setIsSubmitting(false);
    }
  }

  function handleWelcomeComplete() {
    setShowWelcome(false);
    redirected.current = true;
    const profile = userProfile ?? pendingUserProfile.current;
    if (!profile?.profileCompleted) {
      navigate({ to: "/profile-setup" });
    } else {
      navigate({ to: "/status" });
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <WelcomeTransition
        isVisible={showWelcome}
        userName={
          successState?.mode === "login" ? successState.name : undefined
        }
        onComplete={handleWelcomeComplete}
      />
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='3'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Neon blobs */}
      <div className="neon-blob neon-blob--purple" />
      <div className="neon-blob neon-blob--magenta" />
      <div className="neon-blob neon-blob--cyan" />
      {/* Extra gold blob */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: "clamp(200px,30vw,440px)",
          height: "clamp(150px,22vw,320px)",
          background:
            "radial-gradient(ellipse, oklch(0.75 0.18 70 / 0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
          bottom: "20%",
          left: "5%",
          animation: "blobDrift2 28s ease-in-out infinite alternate",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 page-transition-in"
        data-ocid="login.card"
      >
        <div className="glass-card-elevated rounded-2xl p-8 md:p-10">
          {successState ? (
            <SuccessState successState={successState} />
          ) : (
            <>
              {/* Brand */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center mb-3">
                  <span className="font-display font-black text-3xl tracking-[0.15em] bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    10s Only
                  </span>
                </div>
                <p className="font-display text-sm tracking-[0.25em] uppercase text-muted-foreground">
                  The VIP Entrance
                </p>
              </div>

              {/* Tabs */}
              <div
                className="relative flex rounded-xl p-1 mb-8"
                style={{ background: "oklch(0 0 0 / 0.25)" }}
                data-ocid="login.tab_switcher"
              >
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setFormError(null);
                  }}
                  data-ocid="login.signin_tab"
                  className="relative z-10 flex-1 py-2.5 text-sm font-display font-bold tracking-widest uppercase transition-colors duration-200"
                  style={{
                    color:
                      tab === "signin" ? "oklch(0.95 0 0)" : "oklch(0.55 0 0)",
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setFormError(null);
                  }}
                  data-ocid="login.signup_tab"
                  className="relative z-10 flex-1 py-2.5 text-sm font-display font-bold tracking-widest uppercase transition-colors duration-200"
                  style={{
                    color:
                      tab === "signup" ? "oklch(0.95 0 0)" : "oklch(0.55 0 0)",
                  }}
                >
                  Join the List
                </button>
                {/* Animated sliding indicator */}
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-in-out"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.22 290 / 0.7), oklch(0.68 0.27 305 / 0.7))",
                    transform:
                      tab === "signin"
                        ? "translateX(4px)"
                        : "translateX(calc(100% + 0px))",
                    boxShadow: "0 0 16px oklch(0.65 0.22 290 / 0.4)",
                  }}
                />
              </div>

              {/* Error */}
              {formError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm font-body text-red-300 border border-red-500/30"
                  style={{ background: "oklch(0.4 0.15 25 / 0.18)" }}
                  data-ocid="login.error_state"
                >
                  {formError}
                </div>
              )}

              {/* Sign In Form */}
              <div
                className="transition-all duration-300"
                style={{
                  opacity: tab === "signin" ? 1 : 0,
                  transform:
                    tab === "signin" ? "translateX(0)" : "translateX(-20px)",
                  display: tab === "signin" ? "block" : "none",
                }}
              >
                <form onSubmit={handleSignIn} className="space-y-5">
                  <FloatingInput
                    id="signin-email"
                    label="Email or Phone"
                    type="text"
                    value={signInEmail}
                    onChange={setSignInEmail}
                    autoComplete="username"
                    dataOcid="login.email_input"
                  />
                  <PasswordInput
                    id="signin-pw"
                    label="Password"
                    value={signInPw}
                    onChange={setSignInPw}
                    show={showPw}
                    onToggle={() => setShowPw((v) => !v)}
                    dataOcid="login.password_input"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-ocid="login.signin_submit_button"
                    className="glass-button w-full py-4 text-foreground font-display font-bold tracking-[0.2em] uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Entering...
                      </>
                    ) : (
                      "Enter the Party"
                    )}
                  </button>
                </form>
              </div>

              {/* Sign Up Form */}
              <div
                className="transition-all duration-300"
                style={{
                  opacity: tab === "signup" ? 1 : 0,
                  transform:
                    tab === "signup" ? "translateX(0)" : "translateX(20px)",
                  display: tab === "signup" ? "block" : "none",
                }}
              >
                <form onSubmit={handleSignUp} className="space-y-5">
                  <FloatingInput
                    id="signup-name"
                    label="Your Name"
                    type="text"
                    value={signUpName}
                    onChange={setSignUpName}
                    autoComplete="name"
                    dataOcid="login.name_input"
                  />
                  <FloatingInput
                    id="signup-email"
                    label="Email or Phone"
                    type="text"
                    value={signUpEmail}
                    onChange={setSignUpEmail}
                    autoComplete="username"
                    dataOcid="login.signup_email_input"
                  />
                  <div>
                    <PasswordInput
                      id="signup-pw"
                      label="Create Password"
                      value={signUpPw}
                      onChange={setSignUpPw}
                      show={showSignupPw}
                      onToggle={() => setShowSignupPw((v) => !v)}
                      dataOcid="login.signup_password_input"
                    />
                    {/* Password strength bar */}
                    {signUpPw.length > 0 && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{
                                background:
                                  i <= pwStrength.score
                                    ? pwStrength.score <= 1
                                      ? "oklch(0.55 0.22 25)"
                                      : pwStrength.score <= 3
                                        ? "oklch(0.75 0.18 80)"
                                        : "oklch(0.75 0.18 145)"
                                    : undefined,
                                opacity: i <= pwStrength.score ? 1 : 0.18,
                              }}
                            />
                          ))}
                        </div>
                        <p
                          className="text-xs font-body"
                          style={{ color: "oklch(0.65 0 0)" }}
                        >
                          {pwStrength.label} password
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    data-ocid="login.signup_submit_button"
                    className="glass-button w-full py-4 text-foreground font-display font-bold tracking-[0.2em] uppercase text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Requesting...
                      </>
                    ) : (
                      "Request Access"
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  dataOcid,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  dataOcid: string;
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        data-ocid={dataOcid}
        className="glass-input w-full pt-6 pb-2 px-4 text-foreground font-body text-sm outline-none"
      />
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  dataOcid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  dataOcid: string;
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
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={id === "signup-pw" ? "new-password" : "current-password"}
        data-ocid={dataOcid}
        className="glass-input w-full pt-6 pb-2 pl-4 pr-12 text-foreground font-body text-sm outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        data-ocid={`${dataOcid}_toggle`}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function SuccessState({
  successState,
}: { successState: { name: string; mode: "login" | "signup" } }) {
  const initials = getInitials(successState.name);
  return (
    <div
      className="flex flex-col items-center justify-center py-8 gap-6 page-transition-in"
      data-ocid="login.success_state"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center font-display font-black text-2xl text-foreground"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.22 290), oklch(0.68 0.27 305), oklch(0.55 0.25 315))",
          boxShadow: "0 0 32px oklch(0.65 0.22 290 / 0.5)",
        }}
      >
        {initials}
      </div>
      <div className="text-center space-y-2">
        <p className="font-display font-bold text-xl tracking-wide text-foreground">
          {successState.mode === "login"
            ? `Welcome back, ${successState.name.split(" ")[0]}`
            : `You're in the system, ${successState.name.split(" ")[0]}`}
        </p>
        <p className="font-body text-sm text-muted-foreground">
          {successState.mode === "login"
            ? "Redirecting to your status..."
            : "Setting up your profile..."}
        </p>
      </div>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  );
}
