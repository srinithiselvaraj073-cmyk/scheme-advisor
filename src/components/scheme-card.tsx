import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaveSchemeButton } from "@/components/save-scheme-button";
import type { Scheme } from "@/lib/schemes.functions";

export function SchemeCard({ scheme, footer }: { scheme: Scheme; footer?: React.ReactNode }) {
  return (
    <article className="surface-card card-hover flex h-full flex-col rounded-2xl border border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-accent">
            {scheme.level === "central" ? "Central" : scheme.state}
          </Badge>
          <Badge variant="outline">{scheme.category}</Badge>
        </div>
        <SaveSchemeButton schemeId={scheme.id} />
      </div>

      <h3 className="mt-4 font-display text-lg leading-snug font-semibold">{scheme.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{scheme.description}</p>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        {scheme.department ? (
          <p className="flex items-center gap-2">
            <Building2 className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{scheme.department}</span>
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          {scheme.level === "central" ? "All India" : scheme.state}
        </p>
      </div>

      {footer}

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
        <span className="text-xs text-muted-foreground">
          {scheme.beneficiary_type.slice(0, 2).join(" · ")}
        </span>
        <Button asChild size="sm" variant="secondary">
          <Link to="/schemes/$slug" params={{ slug: scheme.slug }}>
            Details
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
