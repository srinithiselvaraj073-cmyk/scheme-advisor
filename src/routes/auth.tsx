import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCLAIMER } from "@/lib/constants";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or create an account — Sri Scheme Finder" },
      {
        name: "description",
        content:
          "Sign in to save schemes, complete your profile and get personalised government scheme recommendations.",
      },
      { property: "og:title", content: "Sign in — Sri Scheme Finder" },
      {
        property: "og:description",
        content: "Create a free account to save schemes and get personalised recommendations.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setInfo(null);
    setBusy(true);
    try {
      if (isSignUp) {
        if (form.password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (form.password !== form.confirmPassword)
          throw new Error("Passwords do not match.");
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.fullName, phone: form.phone },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
        } else {
          toast.success("Account created");
          navigate({ to: "/profile" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="surface-hero hidden rounded-3xl border border-border/70 p-10 lg:block">
        <span className="surface-brand flex size-12 items-center justify-center rounded-2xl">
          <Landmark className="size-6 text-primary-foreground" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-semibold">
          Your schemes, saved and personalised
        </h2>
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          <li>• Recommendations based on your profile</li>
          <li>• Save schemes to revisit before applying</li>
          <li>• Track how complete your profile is</li>
        </ul>
        <p className="mt-10 text-xs text-muted-foreground">{DISCLAIMER}</p>
      </div>

      <div className="surface-card rounded-3xl border border-border/70 p-8">
        <h1 className="font-display text-2xl font-semibold">
          {isSignUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp
            ? "It takes a minute and unlocks personalised scheme matching."
            : "Welcome back. Sign in to see your dashboard."}
        </p>

        {info ? (
          <div className="mt-5 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
            {info}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {isSignUp ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {isSignUp ? (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
          ) : null}

          <Button type="submit" size="lg" className="surface-brand border-0" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to Sri Scheme Finder?"}{" "}
          <button
            type="button"
            className="text-accent hover:underline"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setInfo(null);
            }}
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          You can browse every scheme without an account.{" "}
          <Link to="/schemes" className="text-accent hover:underline">
            Explore schemes
          </Link>
        </p>
      </div>
    </div>
  );
}
