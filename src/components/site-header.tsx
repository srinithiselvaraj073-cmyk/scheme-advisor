import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Landmark, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/schemes", label: "Explore Schemes" },
  { to: "/eligibility", label: "Eligibility Checker" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="surface-brand flex size-10 items-center justify-center rounded-xl">
            <Landmark className="size-5 text-primary-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">Sri Scheme Finder</span>
            <span className="block text-[11px] text-muted-foreground">
              Schemes you are eligible for
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user ? (
            <>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="surface-brand border-0">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-10 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-foreground" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Saved Schemes
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Sign in / Sign up
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
