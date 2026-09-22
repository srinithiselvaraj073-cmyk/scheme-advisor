import { createServerFn } from "@tanstack/react-start";
import { evaluateEligibility, type EligibilityProfile } from "./eligibility";
import type { Scheme } from "./schemes.functions";

export type EligibilityAnswer = EligibilityProfile;

export type MatchedScheme = {
  scheme: Scheme;
  status: "eligible" | "potentially_eligible" | "not_eligible";
  matched: string[];
  missing: string[];
  unknown: string[];
  score: number;
};

/** Public: runs the eligibility engine on the server against rules stored in the database. */
export const checkEligibility = createServerFn({ method: "POST" })
  .inputValidator((data: EligibilityAnswer) => data ?? {})
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const { data: rows, error } = await supabase.from("schemes").select("*").eq("status", "active");
    if (error) throw new Error(error.message);

    const results: MatchedScheme[] = (rows ?? [])
      .filter((scheme) => {
        // Drop state schemes of other states when the user told us their state.
        if (scheme.level === "state" && data.state && scheme.state && scheme.state !== data.state)
          return false;
        return true;
      })
      .map((scheme) => {
        const result = evaluateEligibility(scheme.eligibility_rules, data);
        return { scheme: scheme as Scheme, ...result };
      });

    const order = { eligible: 0, potentially_eligible: 1, not_eligible: 2 } as const;
    results.sort((a, b) => order[a.status] - order[b.status] || b.score - a.score);

    return {
      eligible: results.filter((r) => r.status === "eligible"),
      potential: results.filter((r) => r.status === "potentially_eligible"),
      notEligible: results.filter((r) => r.status === "not_eligible"),
      checkedCount: results.length,
    };
  });
