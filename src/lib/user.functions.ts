import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { evaluateEligibility } from "./eligibility";
import type { Database } from "@/integrations/supabase/types";
import type { Scheme } from "./schemes.functions";
import type { MatchedScheme } from "./eligibility.functions";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileInput = {
  full_name?: string | null;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  occupation?: string | null;
  annual_income?: number | null;
  category?: string | null;
  education?: string | null;
  is_student?: boolean;
  is_farmer?: boolean;
  has_disability?: boolean;
};

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile, error }, { data: roles }, { count: savedCount }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("saved_schemes").select("id", { count: "exact", head: true }),
    ]);
    if (error) throw new Error(error.message);

    return {
      profile: (profile ?? null) as Profile | null,
      isAdmin: (roles ?? []).some((r) => r.role === "admin"),
      savedCount: savedCount ?? 0,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ProfileInput) => {
    if (data.age != null && (data.age < 0 || data.age > 120)) throw new Error("Enter a valid age.");
    if (data.annual_income != null && data.annual_income < 0)
      throw new Error("Enter a valid annual income.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update({ ...data })
      .eq("id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as Profile | null;
  });

export const getSavedSchemes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("saved_schemes")
      .select("scheme_id, created_at, schemes(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => row.schemes as Scheme | null)
      .filter((s): s is Scheme => Boolean(s));
  });

export const getSavedSchemeIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("saved_schemes").select("scheme_id");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.scheme_id);
  });

export const toggleSavedScheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { schemeId: string }) => {
    if (!data?.schemeId) throw new Error("Missing scheme.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing, error: readError } = await supabase
      .from("saved_schemes")
      .select("id")
      .eq("scheme_id", data.schemeId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    if (existing) {
      const { error } = await supabase.from("saved_schemes").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { saved: false };
    }

    const { error } = await supabase
      .from("saved_schemes")
      .insert({ user_id: userId, scheme_id: data.schemeId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const getRecommendedSchemes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    const { data: rows, error } = await supabase.from("schemes").select("*").eq("status", "active");
    if (error) throw new Error(error.message);

    const answers = profile ?? {};
    const results: MatchedScheme[] = (rows ?? [])
      .filter((s) => !(s.level === "state" && profile?.state && s.state && s.state !== profile.state))
      .map((scheme) => ({
        scheme: scheme as Scheme,
        ...evaluateEligibility(scheme.eligibility_rules, answers),
      }))
      .filter((r) => r.status !== "not_eligible")
      .sort((a, b) => (a.status === b.status ? b.score - a.score : a.status === "eligible" ? -1 : 1));

    return results.slice(0, 12);
  });
