import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, SearchX, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchemeCard } from "@/components/scheme-card";
import { listSchemes } from "@/lib/schemes.functions";
import { BENEFICIARY_TYPES, CATEGORIES, INDIAN_STATES } from "@/lib/constants";

const searchSchema = z.object({
  q: z.string().optional(),
  level: z.string().optional(),
  state: z.string().optional(),
  category: z.string().optional(),
  beneficiary: z.string().optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute("/schemes/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Explore Government Schemes — Sri Scheme Finder" },
      {
        name: "description",
        content:
          "Search and filter central and state government schemes by government level, state, category and beneficiary type.",
      },
      { property: "og:title", content: "Explore Government Schemes — Sri Scheme Finder" },
      {
        property: "og:description",
        content: "Filter verified central and state welfare schemes by category, state and beneficiary.",
      },
    ],
  }),
  component: ExploreSchemes,
});

function ExploreSchemes() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const fetchSchemes = useServerFn(listSchemes);
  const [term, setTerm] = useState(search.q ?? "");

  const filters = {
    search: search.q ?? "",
    level: search.level ?? "all",
    state: search.state ?? "all",
    category: search.category ?? "all",
    beneficiary: search.beneficiary ?? "all",
    page: search.page ?? 1,
  };

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["schemes", filters],
    queryFn: () => fetchSchemes({ data: filters }),
    placeholderData: keepPreviousData,
  });

  function setFilter(key: string, value: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value === "all" ? undefined : value,
        page: undefined,
      }),
    });
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Explore schemes</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every filter and search runs on the server against the scheme database, so results always
          reflect the latest published information.
        </p>
      </header>

      <form
        className="surface-card mt-8 grid gap-3 rounded-2xl border border-border/70 p-4 md:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          navigate({ search: (prev) => ({ ...prev, q: term || undefined, page: undefined }) });
        }}
      >
        <div className="relative md:col-span-2">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search schemes, departments…"
            className="pl-9"
            aria-label="Search schemes"
          />
        </div>

        <Select value={filters.level} onValueChange={(value) => setFilter("level", value)}>
          <SelectTrigger aria-label="Government level">
            <SelectValue placeholder="Government" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All governments</SelectItem>
            <SelectItem value="central">Central government</SelectItem>
            <SelectItem value="state">State government</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.state} onValueChange={(value) => setFilter("state", value)}>
          <SelectTrigger aria-label="State">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {INDIAN_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(value) => setFilter("category", value)}>
          <SelectTrigger aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.beneficiary}
          onValueChange={(value) => setFilter("beneficiary", value)}
        >
          <SelectTrigger aria-label="Beneficiary">
            <SelectValue placeholder="Beneficiary" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All beneficiaries</SelectItem>
            {BENEFICIARY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {isPending ? "Loading schemes…" : `${data?.total ?? 0} schemes found`}
        </p>
        {isFetching && !isPending ? (
          <Loader2 className="size-4 animate-spin text-accent" />
        ) : null}
      </div>

      {isError ? (
        <div className="surface-card mt-6 rounded-2xl border border-destructive/40 p-8 text-center">
          <p className="text-sm text-destructive">
            We could not load schemes: {(error as Error).message}
          </p>
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {data && data.items.length === 0 ? (
        <div className="surface-card mt-6 flex flex-col items-center gap-4 rounded-2xl border border-border/70 p-12 text-center">
          <SearchX className="size-8 text-muted-foreground" />
          <div>
            <h2 className="font-display text-lg font-semibold">No schemes match these filters</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing a filter or searching with a different keyword.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate({ search: {} })}>
            Clear all filters
          </Button>
        </div>
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                disabled={filters.page <= 1}
                onClick={() =>
                  navigate({ search: (prev) => ({ ...prev, page: filters.page - 1 }) })
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={filters.page >= totalPages}
                onClick={() =>
                  navigate({ search: (prev) => ({ ...prev, page: filters.page + 1 }) })
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <p className="mt-12 text-xs text-muted-foreground">
        Looking for something personalised?{" "}
        <Link to="/eligibility" className="text-accent hover:underline">
          Run the eligibility checker
        </Link>
        .
      </p>
    </div>
  );
}
