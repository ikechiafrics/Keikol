import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, X } from "lucide-react";

import { Field, PageHero, Section } from "@/components";
import { useAuth } from "@/lib/auth-context";
import { firebaseErrorMessage } from "@/lib/firebase-errors";

type SignInSearch = { redirect?: string };

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [{ title: "Sign In — Keikol" }],
  }),
  component: SignInPage,
});

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

type Mode = "signin" | "signup" | "reset";

function getPasswordError(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  return null;
}

const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-gold",
  "bg-electric",
  "bg-green-500",
];

function getPasswordStrength(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return { label: STRENGTH_LABELS[score], score };
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { label, score } = getPasswordStrength(password);
  const color = STRENGTH_COLORS[score];

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < score ? color : "bg-border"}`} />
        ))}
      </div>
      <p className={`mt-1 text-xs font-semibold ${color.replace("bg-", "text-")}`}>{label}</p>
    </div>
  );
}

function SignInPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function goToDestination() {
    navigate({ to: redirect || "/dashboard" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");

    if (mode === "signup") {
      const passwordError = getPasswordError(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords don't match.");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      goToDestination();
    } catch (err) {
      toast.error(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResetSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");

    setSubmitting(true);
    try {
      await resetPassword(email);
      toast.success("Password reset email sent. Check your inbox.");
      setMode("signin");
    } catch (err) {
      toast.error(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      goToDestination();
    } catch (err) {
      toast.error(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Account"
        title={
          mode === "reset" ? (
            <>
              Reset your <span className="text-gradient-gold">password</span>
            </>
          ) : mode === "signin" ? (
            <>
              Sign in to your <span className="text-gradient-gold">Keikol account</span>
            </>
          ) : (
            <>
              Create your <span className="text-gradient-gold">Keikol account</span>
            </>
          )
        }
        subtitle="Book billboards, upload campaign artwork, and track your bookings from one dashboard."
      />

      <Section>
        <div className="animate-fade-up mx-auto max-w-md rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9">
          {mode !== "reset" && (
            <div className="mb-6 inline-flex w-full rounded-xl border border-border bg-background/60 p-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "signin"
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  mode === "signup"
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {mode === "reset" ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={onResetSubmit} className="space-y-4">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@brand.com"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting ? "Sending…" : "Send Reset Link"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="mt-6 text-sm font-semibold text-gold hover:underline"
              >
                ← Back to sign in
              </button>
            </>
          ) : (
            <>
              <form onSubmit={onSubmit} className="space-y-4">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@brand.com"
                />
                <div>
                  <Field
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    hint={
                      mode === "signup"
                        ? "At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
                        : undefined
                    }
                  />
                  {mode === "signup" && <PasswordStrengthMeter password={password} />}
                  {mode === "signin" && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-xs font-semibold text-gold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
                {mode === "signup" && (
                  <div>
                    <Field
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                    />
                    {confirmPassword.length > 0 && (
                      <p
                        className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${
                          password === confirmPassword ? "text-green-600" : "text-destructive"
                        }`}
                      >
                        {password === confirmPassword ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Passwords match
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" /> Passwords don't match
                          </>
                        )}
                      </p>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting
                    ? mode === "signin"
                      ? "Signing in…"
                      : "Creating account…"
                    : mode === "signin"
                      ? "Sign In"
                      : "Create Account"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or{" "}
                <div className="h-px flex-1 bg-border" />
              </div>

              <button
                type="button"
                onClick={onGoogle}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3.5 text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-60"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
