import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark, Sparkles, UserCog } from "lucide-react";
import { AccountNav } from "@/components/account-nav";
import { SchemeCard } from "@/components/scheme-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { profileCompletion } from "@/lib/eligibility";
import { getMyAccount, getRecommendedSchemes, getSavedSchemes } from "@/lib/user.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Sri Scheme Finder" },
      {
        name: "description",
        content: "Your recommended schemes, saved schemes and profile completion in one place.",
      },
      { property: "og:title", content: "My Dashboard — Sri Scheme Finder" },
      { property: "og:description", content: "Personalised government scheme recommendations." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const fetchAccount = useServerFn(getMyAccount);
  const fetchRecommended = useServerFn(getRecommendedSchemes);
  const fetchSaved = useServerFn(getSavedSchemes);

  const account = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount() });
  const recommended = useQuery({
    queryKey: ["recommended-schemes"],
    queryFn: () => fetchRecommended(),
  });
  const saved = useQuery({ queryKey: ["saved-schemes"], queryFn: () => fetchSaved() });

  const completion = profileCompletion(account.data?.profile as never);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {account.data?.profile?.full_name
            ? `Hello, ${account.data.profile.full_name.split(" ")[0]}`
            : "Your dashboard"}
        </h1>
        <AccountNav isAdmin={account.data?.isAdmin} />
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="surface-card rounded-2xl border border-border/70 p-6">
          <UserCog className="size-5 text-accent" />
          <h2 className="mt-3 text-sm text-muted-foreground">Profile completion</h2>
          <p className="mt-1 font-display text-3xl font-semibold">{completion}%</p>
          <Progress value={completion} className="mt-4" />
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <Link to="/profile">Update profile</Link>
          </Button>
        </div>

        <div className="surface-card rounded-2xl border border-border/70 p-6">
          <Sparkles className="size-5 text-accent" />
          <h2 className="mt-3 text-sm text-muted-foreground">Matching schemes</h2>
          <p className="mt-1 font-display text-3xl font-semibold">
            {recommended.isPending ? "…" : recommended.data?.length ?? 0}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on the details in your profile.
          </p>
        </div>

        <div className="surface-card rounded-2xl border border-border/70 p-6">
          <Bookmark className="size-5 text-accent" />
          <h2 className="mt-3 text-sm text-muted-foreground">Saved schemes</h2>
          <p className="mt-1 font-display text-3xl font-semibold">
            {account.isPending ? "…" : account.data?.savedCount ?? 0}
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-4">
            <Link to="/saved">View saved</Link>
          </Button>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Recommended for you</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/eligibility">Run full eligibility check</Link>
          </Button>
        </div>

        {recommended.isPending ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : recommended.isError ? (
          <p className="mt-6 text-sm text-destructive">
            {(recommended.error as Error).message}
          </p>
        ) : (recommended.data ?? []).length === 0 ? (
          <div className="surface-card mt-6 rounded-2xl border border-border/70 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Add your age, state, income and category to your profile and we will match schemes for
              you.
            </p>
            <Button asChild className="surface-brand mt-5 border-0">
              <Link to="/profile">Complete profile</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.data!.map((item) => (
              <SchemeCard
                key={item.scheme.id}
                scheme={item.scheme}
                footer={
                  <div className="mt-4">
                    <StatusPill status={item.status} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">Recently saved</h2>
        {saved.isPending ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : (saved.data ?? []).length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing saved yet — use the bookmark icon on any scheme.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.data!.slice(0, 3).map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
