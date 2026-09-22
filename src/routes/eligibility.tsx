import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/status-pill";
import { checkEligibility, type MatchedScheme } from "@/lib/eligibility.functions";
import {
  EDUCATION_LEVELS,
  GENDERS,
  INDIAN_STATES,
  OCCUPATIONS,
  SOCIAL_CATEGORIES,
} from "@/lib/constants";

export const Route = createFileRoute("/eligibility")({
  head: () => ({
    meta: [
      { title: "Eligibility Checker — Find Schemes For Me | Sri Scheme Finder" },
      {
        name: "description",
        content:
          "Enter your age, state, income and category to see which central and state government schemes you are eligible for.",
      },
      { property: "og:title", content: "Eligibility Checker — Sri Scheme Finder" },
      {
        property: "og:description",
        content: "Server-side eligibility matching against real government scheme rules.",
      },
    ],
  }),
  component: EligibilityChecker,
});

type FormState = {
  age: string;
  gender: string;
  state: string;
  district: string;
  occupation: string;
  annual_income: string;
  category: string;
  education: string;
  is_student: boolean;
  is_farmer: boolean;
  has_disability: boolean;
};

const EMPTY: FormState = {
  age: "",
  gender: "",
  state: "",
  district: "",
  occupation: "",
  annual_income: "",
  category: "",
  education: "",
  is_student: false,
  is_farmer: false,
  has_disability: false,
};

function ResultCard({ item }: { item: MatchedScheme }) {
  return (
    <article className="surface-card rounded-2xl border border-border/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{item.scheme.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.scheme.level === "central" ? "Central Government" : `${item.scheme.state} Government`}{" "}
            · {item.scheme.category}
          </p>
        </div>
        <StatusPill status={item.status} />
      </div>

      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        {item.matched.length ? (
          <div>
            <p className="font-medium text-success">Criteria you meet</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {item.matched.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {item.unknown.length ? (
          <div>
            <p className="font-medium text-warning">Details still needed</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {item.unknown.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {item.missing.length ? (
          <div>
            <p className="font-medium text-destructive">Criteria not met</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {item.missing.map((c) => (
                <li key={c}>• {c}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link to="/schemes/$slug" params={{ slug: item.scheme.slug }}>
            View details
          </Link>
        </Button>
        {item.scheme.official_application_url ? (
          <Button asChild size="sm" className="surface-brand border-0">
            <a
              href={item.scheme.official_application_url}
              target="_blank"
              rel="noreferrer noopener"
            >
              Apply
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function EligibilityChecker() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const run = useServerFn(checkEligibility);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          age: form.age ? Number(form.age) : null,
          gender: form.gender || null,
          state: form.state || null,
          occupation: form.occupation || null,
          annual_income: form.annual_income ? Number(form.annual_income) : null,
          category: form.category || null,
          education: form.education || null,
          is_student: form.is_student,
          is_farmer: form.is_farmer,
          has_disability: form.has_disability,
        },
      }),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const result = mutation.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-accent">
          <Sparkles className="size-3.5" />
          Find Schemes For Me
        </span>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Eligibility checker</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Your answers are sent to our server and compared with the eligibility rules stored for each
          scheme. Nothing is decided in your browser.
        </p>
      </header>

      <form
        className="surface-card mt-8 grid gap-5 rounded-2xl border border-border/70 p-6 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={0}
            max={120}
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            placeholder="e.g. 32"
          />
        </div>

        <div className="grid gap-2">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>State</Label>
          <Select value={form.state} onValueChange={(v) => update("state", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="income">Annual family income (Rs)</Label>
          <Input
            id="income"
            type="number"
            min={0}
            value={form.annual_income}
            onChange={(e) => update("annual_income", e.target.value)}
            placeholder="e.g. 180000"
          />
        </div>

        <div className="grid gap-2">
          <Label>Social category</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {SOCIAL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Occupation</Label>
          <Select value={form.occupation} onValueChange={(v) => update("occupation", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select occupation" />
            </SelectTrigger>
            <SelectContent>
              {OCCUPATIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Education</Label>
          <Select value={form.education} onValueChange={(v) => update("education", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select education" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 md:col-span-1">
          <Label htmlFor="student">Currently studying</Label>
          <Switch
            id="student"
            checked={form.is_student}
            onCheckedChange={(v) => update("is_student", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
          <Label htmlFor="farmer">Farmer household</Label>
          <Switch
            id="farmer"
            checked={form.is_farmer}
            onCheckedChange={(v) => update("is_farmer", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
          <Label htmlFor="disability">Person with disability</Label>
          <Switch
            id="disability"
            checked={form.has_disability}
            onCheckedChange={(v) => update("has_disability", v)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 md:col-span-3">
          <Button type="submit" size="lg" className="surface-brand border-0" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            Find schemes for me
          </Button>
          <Button type="button" variant="ghost" onClick={() => setForm(EMPTY)}>
            Reset
          </Button>
        </div>
      </form>

      {mutation.isError ? (
        <p className="mt-6 text-sm text-destructive">
          Could not run the check: {(mutation.error as Error).message}
        </p>
      ) : null}

      {mutation.isPending ? (
        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Comparing your details with scheme rules…
        </p>
      ) : null}

      {result ? (
        <div className="mt-10 space-y-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{result.checkedCount} schemes checked</Badge>
            <Badge className="bg-success/15 text-success">{result.eligible.length} eligible</Badge>
            <Badge className="bg-warning/15 text-warning">
              {result.potential.length} potentially eligible
            </Badge>
            <Badge variant="outline">{result.notEligible.length} not eligible</Badge>
          </div>

          {result.eligible.length === 0 && result.potential.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No matches yet. Try filling in more details — many schemes depend on age, income and
              state.
            </p>
          ) : null}

          {result.eligible.length ? (
            <section>
              <h2 className="font-display text-xl font-semibold">You appear eligible</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {result.eligible.map((item) => (
                  <ResultCard key={item.scheme.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {result.potential.length ? (
            <section>
              <h2 className="font-display text-xl font-semibold">Potentially eligible</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A few details are missing. Fill them in to confirm.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {result.potential.map((item) => (
                  <ResultCard key={item.scheme.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {result.notEligible.length ? (
            <section>
              <h2 className="font-display text-xl font-semibold">Not eligible right now</h2>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {result.notEligible.map((item) => (
                  <ResultCard key={item.scheme.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
