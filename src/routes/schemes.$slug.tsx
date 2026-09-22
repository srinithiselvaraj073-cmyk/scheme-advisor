import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  ListChecks,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SaveSchemeButton } from "@/components/save-scheme-button";
import { getSchemeBySlug } from "@/lib/schemes.functions";
import { DISCLAIMER } from "@/lib/constants";

const schemeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["scheme", slug],
    queryFn: () => getSchemeBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/schemes/$slug")({
  loader: async ({ context, params }) => {
    const scheme = await context.queryClient.ensureQueryData(schemeQuery(params.slug));
    if (!scheme) throw notFound();
    return { name: scheme.name, description: scheme.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Scheme not found — Sri Scheme Finder" }, { name: "robots", content: "noindex" }],
      };
    }
    const description = loaderData.description.slice(0, 160);
    return {
      meta: [
        { title: `${loaderData.name} — Sri Scheme Finder` },
        { name: "description", content: description },
        { property: "og:title", content: `${loaderData.name} — Sri Scheme Finder` },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">Scheme not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This scheme may have been deactivated or the link is incorrect.
      </p>
      <Button asChild className="mt-6" variant="secondary">
        <Link to="/schemes">Back to all schemes</Link>
      </Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">We could not load this scheme</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: SchemeDetail,
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FileText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-2xl border border-border/70 p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className="size-4 text-accent" />
        {title}
      </h2>
      <div className="mt-4 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function SchemeDetail() {
  const { slug } = Route.useParams();
  const { data: scheme } = useSuspenseQuery(schemeQuery(slug));
  if (!scheme) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        to="/schemes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All schemes
      </Link>

      <header className="surface-hero mt-6 rounded-3xl border border-border/70 p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-accent">
            {scheme.level === "central" ? "Central Government" : `${scheme.state} Government`}
          </Badge>
          <Badge variant="outline">{scheme.category}</Badge>
          {scheme.beneficiary_type.map((type) => (
            <Badge key={type} variant="outline">
              {type}
            </Badge>
          ))}
        </div>
        <h1 className="mt-5 font-display text-3xl leading-tight font-bold sm:text-4xl">
          {scheme.name}
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {scheme.description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {scheme.official_application_url ? (
            <Button asChild size="lg" className="surface-brand border-0">
              <a href={scheme.official_application_url} target="_blank" rel="noreferrer noopener">
                Apply on official portal
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
          {scheme.official_website ? (
            <Button asChild size="lg" variant="secondary">
              <a href={scheme.official_website} target="_blank" rel="noreferrer noopener">
                Official website
                <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
          <SaveSchemeButton schemeId={scheme.id} withLabel />
        </div>

        <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
          {scheme.department ? (
            <p className="flex items-center gap-2">
              <Building2 className="size-3.5" />
              {scheme.department}
            </p>
          ) : null}
          <p className="flex items-center gap-2">
            <MapPin className="size-3.5" />
            {scheme.level === "central" ? "All India" : scheme.state}
          </p>
          {scheme.last_verified_date ? (
            <p className="flex items-center gap-2">
              <CalendarCheck className="size-3.5" />
              Last verified {scheme.last_verified_date}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Section icon={CheckCircle2} title="Benefits">
          <ul className="space-y-2">
            {scheme.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ShieldCheck} title="Eligibility">
          <ul className="space-y-2">
            {scheme.eligibility_notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <Link to="/eligibility">Check if you qualify</Link>
          </Button>
        </Section>

        <Section icon={FileText} title="Required documents">
          <ul className="space-y-2">
            {scheme.documents.map((doc) => (
              <li key={doc} className="flex gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="How to apply">
          <ol className="space-y-3">
            {scheme.application_process.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="surface-brand flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>

      <div className="surface-card mt-6 rounded-2xl border border-border/70 p-6 text-xs text-muted-foreground">
        {scheme.official_source ? (
          <p>
            <span className="font-medium text-foreground">Official source:</span>{" "}
            {scheme.official_source}
          </p>
        ) : null}
        <p className="mt-3">{DISCLAIMER}</p>
      </div>
    </div>
  );
}
