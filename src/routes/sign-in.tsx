import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

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

function SignInPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);

  function goToDestination() {
    navigate({ to: redirect || "/dashboard" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

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
          mode === "signin" ? (
            <>Sign in to your <span className="text-gradient-gold">Keikol account</span></>
          ) : (
            <>Create your <span className="text-gradient-gold">Keikol account</span></>
          )
        }
        subtitle="Book billboards, upload campaign artwork, and track your bookings from one dashboard."
      />

      <Section>
        <div className="mx-auto max-w-md rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email Address" name="email" type="email" placeholder="you@brand.com" />
            <Field label="Password" name="password" type="password" placeholder="••••••••" />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3.5 text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-gold hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </Section>
    </>
  );
}
