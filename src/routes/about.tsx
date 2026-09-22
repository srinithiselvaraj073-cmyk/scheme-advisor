import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Database, Globe2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCLAIMER } from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Sri Scheme Finder" },
      {
        name: "description",
        content:
          "Sri Scheme Finder brings verified central and state government scheme information together with an eligibility checker and official application links.",
      },
      { property: "og:title", content: "About Sri Scheme Finder" },
      {
        property: "og:description",
        content: "Why we built a single searchable home for verified government scheme information.",
      },
    ],
  }),
  component: About,
});

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Verified information only",
    body: "Every scheme record stores its official source, official website and the date the information was last verified. We do not invent schemes or eligibility rules.",
  },
  {
    icon: Database,
    title: "Rules live in the database",
    body: "Eligibility criteria are stored as structured rules, so the eligibility checker compares your details on the server instead of guessing in the browser.",
  },
  {
    icon: Globe2,
    title: "Central and state coverage",
    body: "The platform supports central government schemes and state schemes, starting with Tamil Nadu and built to expand to every Indian state.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    body: "Profile details are stored against your own account with row level security, and are only used to match you with schemes.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="surface-hero rounded-3xl border border-border/70 p-8 sm:p-12">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Welfare schemes are only useful if people know they exist
        </h1>
        <p className="mt-5 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Thousands of central and state government schemes support farmers, students, women,
          workers, senior citizens, entrepreneurs and persons with disabilities. The information is
          public, but scattered across dozens of portals. Sri Scheme Finder brings it together, adds
          plain-language eligibility, and sends you to the official portal to apply.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <section key={pillar.title} className="surface-card rounded-2xl border border-border/70 p-6">
            <pillar.icon className="size-5 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold">{pillar.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
          </section>
        ))}
      </div>

      <section className="surface-card mt-10 rounded-2xl border border-border/70 p-6">
        <h2 className="font-display text-lg font-semibold">Important note</h2>
        <p className="mt-3 text-sm text-muted-foreground">{DISCLAIMER}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="surface-brand border-0">
            <Link to="/eligibility">Check your eligibility</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/contact">Report outdated information</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
