import { Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="surface-brand flex size-9 items-center justify-center rounded-xl">
              <Landmark className="size-4 text-primary-foreground" />
            </span>
            <span className="font-display text-base font-semibold">Sri Scheme Finder</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Discover the Government Schemes You&apos;re Eligible For — central and state welfare
            schemes in one searchable place, with official sources and application links.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/schemes" className="hover:text-foreground">
                All schemes
              </Link>
            </li>
            <li>
              <Link to="/eligibility" className="hover:text-foreground">
                Find schemes for me
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                My dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sri Scheme Finder. All scheme information is sourced from
            official government portals.
          </p>
        </div>
      </div>
    </footer>
  );
}
