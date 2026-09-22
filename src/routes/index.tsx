import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  Landmark,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-schemes.jpg";
import { Button } from "@/components/ui/button";
import { getSchemeStats } from "@/lib/schemes.functions";

const statsQuery = queryOptions({
  queryKey: ["scheme-stats"],
  queryFn: () => getSchemeStats(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  head: () => ({
    meta: [
      { title: "Sri Scheme Finder — Discover the Government Schemes You're Eligible For" },
      {
        name: "description",
        content:
          "Search central and Tamil Nadu government welfare schemes, check your eligibility instantly and apply on the official portal.",
      },
      {
        property: "og:title",
        content: "Sri Scheme Finder — Discover the Government Schemes You're Eligible For",
      },
      {
        property: "og:description",
        content:
          "Search verified central and state government schemes, check eligibility and apply through official portals.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    icon: Users,
    title: "Create your profile",
    body: "Tell us your age, state, income, category and occupation once. It stays private to your account.",
  },
  {
    icon: ClipboardList,
    title: "Run the eligibility check",
    body: "Our server compares your details against the eligibility rules stored for every scheme.",
  },
  {
    icon: BadgeCheck,
    title: "Apply on official portals",
    body: "Read benefits, documents and the process, then apply through the official government link.",
  },
];

function Home() {
  const { data: stats } = useSuspenseQuery(statsQuery);

  return (
    <div>
      <section className="surface-hero relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-accent">
              <Sparkles className="size-3.5" />
              Central + Tamil Nadu schemes, verified sources
            </span>
            <h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
              Discover the <span className="text-brand-gradient">Government Schemes</span> You&apos;re
              Eligible For
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              One place to search real central and state welfare schemes, understand the eligibility
              rules in plain language, and reach the official application page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="surface-brand border-0">
                <Link to="/eligibility">
                  Find schemes for me
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link to="/schemes">
                  <Search className="size-4" />
                  Explore all schemes
                </Link>
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Schemes listed", value: stats.total, icon: Landmark },
                { label: "Central schemes", value: stats.central, icon: Building2 },
                { label: "State schemes", value: stats.state, icon: MapPin },
                { label: "Categories", value: stats.categories.length, icon: ShieldCheck },
              ].map((item) => (
                <div
                  key={item.label}
                  className="surface-card rounded-xl border border-border/70 px-4 py-4"
                >
                  <item.icon className="size-4 text-accent" />
                  <dd className="mt-2 font-display text-2xl font-semibold">{item.value}</dd>
                  <dt className="text-xs text-muted-foreground">{item.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="glow overflow-hidden rounded-3xl border border-border/70">
              <img
                src={heroImage}
                alt="Illustration of government schemes, documents and eligibility checks"
                width={1600}
                height={1008}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-3xl font-semibold">Browse by category</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            From farming and scholarships to housing, health and entrepreneurship — pick a category
            to see every listed scheme with its official source.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.categories.map((category) => (
            <Link
              key={category.name}
              to="/schemes"
              search={{ category: category.name }}
              className="surface-card card-hover flex items-center justify-between rounded-2xl border border-border/70 px-5 py-5"
            >
              <span>
                <span className="block font-medium">{category.name}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count} {category.count === 1 ? "scheme" : "schemes"}
                </span>
              </span>
              <ArrowRight className="size-4 text-accent" />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="surface-card rounded-2xl border border-border/70 p-6"
              >
                <span className="surface-brand inline-flex size-10 items-center justify-center rounded-xl text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <step.icon className="mt-5 size-5 text-accent" />
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="surface-card glow flex flex-col items-start gap-6 rounded-3xl border border-border/70 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              Ready to see what you qualify for?
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Create a free account to save schemes, keep your profile handy and get personalised
              recommendations on your dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="surface-brand border-0">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create free account
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/eligibility">Check eligibility</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
