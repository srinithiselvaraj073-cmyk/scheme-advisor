import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bookmark } from "lucide-react";
import { AccountNav } from "@/components/account-nav";
import { SchemeCard } from "@/components/scheme-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyAccount, getSavedSchemes } from "@/lib/user.functions";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved Schemes — Sri Scheme Finder" },
      { name: "description", content: "The government schemes you bookmarked for later." },
      { property: "og:title", content: "Saved Schemes — Sri Scheme Finder" },
      { property: "og:description", content: "Your bookmarked government schemes." },
    ],
  }),
  component: SavedSchemes,
});

function SavedSchemes() {
  const fetchSaved = useServerFn(getSavedSchemes);
  const fetchAccount = useServerFn(getMyAccount);
  const account = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount() });
  const saved = useQuery({ queryKey: ["saved-schemes"], queryFn: () => fetchSaved() });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Saved schemes</h1>
        <AccountNav isAdmin={account.data?.isAdmin} />
      </header>

      {saved.isPending ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : saved.isError ? (
        <p className="mt-8 text-sm text-destructive">{(saved.error as Error).message}</p>
      ) : (saved.data ?? []).length === 0 ? (
        <div className="surface-card mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border/70 p-12 text-center">
          <Bookmark className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You have not saved any schemes yet. Bookmark schemes while browsing to find them here.
          </p>
          <Button asChild className="surface-brand border-0">
            <Link to="/schemes">Explore schemes</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.data!.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
}
