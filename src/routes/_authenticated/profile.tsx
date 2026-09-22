import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountNav } from "@/components/account-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileCompletion } from "@/lib/eligibility";
import { getMyAccount, updateMyProfile } from "@/lib/user.functions";
import {
  EDUCATION_LEVELS,
  GENDERS,
  INDIAN_STATES,
  OCCUPATIONS,
  SOCIAL_CATEGORIES,
} from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Sri Scheme Finder" },
      {
        name: "description",
        content: "Keep your personal details up to date for accurate scheme recommendations.",
      },
      { property: "og:title", content: "My Profile — Sri Scheme Finder" },
      { property: "og:description", content: "Update the details used for scheme matching." },
    ],
  }),
  component: ProfilePage,
});

type FormState = {
  full_name: string;
  phone: string;
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

function ProfilePage() {
  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();

  const account = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount() });
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    const profile = account.data?.profile;
    if (!profile || form) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      age: profile.age?.toString() ?? "",
      gender: profile.gender ?? "",
      state: profile.state ?? "",
      district: profile.district ?? "",
      occupation: profile.occupation ?? "",
      annual_income: profile.annual_income?.toString() ?? "",
      category: profile.category ?? "",
      education: profile.education ?? "",
      is_student: profile.is_student,
      is_farmer: profile.is_farmer,
      has_disability: profile.has_disability,
    });
  }, [account.data, form]);

  const mutation = useMutation({
    mutationFn: () =>
      saveProfile({
        data: {
          full_name: form!.full_name || null,
          phone: form!.phone || null,
          age: form!.age ? Number(form!.age) : null,
          gender: form!.gender || null,
          state: form!.state || null,
          district: form!.district || null,
          occupation: form!.occupation || null,
          annual_income: form!.annual_income ? Number(form!.annual_income) : null,
          category: form!.category || null,
          education: form!.education || null,
          is_student: form!.is_student,
          is_farmer: form!.is_farmer,
          has_disability: form!.has_disability,
        },
      }),
    onSuccess: () => {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["my-account"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-schemes"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const completion = profileCompletion((form ?? {}) as never);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">My profile</h1>
        <AccountNav isAdmin={account.data?.isAdmin} />
        <p className="max-w-2xl text-sm text-muted-foreground">
          These details are used to match you with schemes. The more you fill in, the more accurate
          your recommendations.
        </p>
      </header>

      {account.isPending || !form ? (
        <Skeleton className="mt-8 h-96 rounded-2xl" />
      ) : (
        <>
          <div className="surface-card mt-8 rounded-2xl border border-border/70 p-6">
            <p className="text-sm text-muted-foreground">Profile completion</p>
            <div className="mt-3 flex items-center gap-4">
              <Progress value={completion} />
              <span className="font-display text-lg font-semibold">{completion}%</span>
            </div>
          </div>

          <form
            className="surface-card mt-6 grid gap-5 rounded-2xl border border-border/70 p-6 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={120}
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
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
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
              />
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
              <Label htmlFor="income">Annual family income (Rs)</Label>
              <Input
                id="income"
                type="number"
                min={0}
                value={form.annual_income}
                onChange={(e) => update("annual_income", e.target.value)}
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

            <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <Label htmlFor="is_student">Currently studying</Label>
              <Switch
                id="is_student"
                checked={form.is_student}
                onCheckedChange={(v) => update("is_student", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <Label htmlFor="is_farmer">Farmer household</Label>
              <Switch
                id="is_farmer"
                checked={form.is_farmer}
                onCheckedChange={(v) => update("is_farmer", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
              <Label htmlFor="has_disability">Person with disability</Label>
              <Switch
                id="has_disability"
                checked={form.has_disability}
                onCheckedChange={(v) => update("has_disability", v)}
              />
            </div>

            <div className="md:col-span-2">
              <Button
                type="submit"
                size="lg"
                className="surface-brand border-0"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save profile
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
