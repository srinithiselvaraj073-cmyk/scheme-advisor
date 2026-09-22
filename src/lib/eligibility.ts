export type EligibilityRules = {
  min_age?: number;
  max_age?: number;
  gender?: string[];
  max_income?: number;
  categories?: string[];
  states?: string[];
  occupations?: string[];
  education?: string[];
  student?: boolean;
  farmer?: boolean;
  disability?: boolean;
  /** When true, the gender and social-category rules count as alternatives. */
  match_any?: boolean;
};

export type EligibilityProfile = {
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  annual_income?: number | null;
  category?: string | null;
  occupation?: string | null;
  education?: string | null;
  is_student?: boolean | null;
  is_farmer?: boolean | null;
  has_disability?: boolean | null;
};

export type EligibilityStatus = "eligible" | "potentially_eligible" | "not_eligible";

export type EligibilityResult = {
  status: EligibilityStatus;
  matched: string[];
  missing: string[];
  unknown: string[];
  score: number;
};

type Check = { label: string; state: "match" | "fail" | "unknown" };

function inr(value: number) {
  return `Rs ${value.toLocaleString("en-IN")}`;
}

export function evaluateEligibility(
  rawRules: unknown,
  profile: EligibilityProfile,
): EligibilityResult {
  const rules = (rawRules ?? {}) as EligibilityRules;
  const checks: Check[] = [];
  const push = (label: string, state: Check["state"]) => checks.push({ label, state });

  if (typeof rules.min_age === "number") {
    const label = `Minimum age ${rules.min_age} years`;
    if (profile.age == null) push(label, "unknown");
    else push(label, profile.age >= rules.min_age ? "match" : "fail");
  }

  if (typeof rules.max_age === "number") {
    const label = `Maximum age ${rules.max_age} years`;
    if (profile.age == null) push(label, "unknown");
    else push(label, profile.age <= rules.max_age ? "match" : "fail");
  }

  if (typeof rules.max_income === "number") {
    const label = `Annual family income up to ${inr(rules.max_income)}`;
    if (profile.annual_income == null) push(label, "unknown");
    else push(label, profile.annual_income <= rules.max_income ? "match" : "fail");
  }

  if (rules.states?.length) {
    const label = `Resident of ${rules.states.join(" or ")}`;
    if (!profile.state) push(label, "unknown");
    else push(label, rules.states.includes(profile.state) ? "match" : "fail");
  }

  const alternatives: Check[] = [];
  const target = rules.match_any ? alternatives : checks;

  if (rules.gender?.length) {
    const label = `Applicant gender: ${rules.gender.join(" or ")}`;
    if (!profile.gender) target.push({ label, state: "unknown" });
    else
      target.push({ label, state: rules.gender.includes(profile.gender) ? "match" : "fail" });
  }

  if (rules.categories?.length) {
    const label = `Social category: ${rules.categories.join(" or ")}`;
    if (!profile.category) target.push({ label, state: "unknown" });
    else
      target.push({
        label,
        state: rules.categories.includes(profile.category) ? "match" : "fail",
      });
  }

  if (rules.match_any && alternatives.length) {
    const label = `Any one of: ${alternatives.map((c) => c.label).join(" | ")}`;
    if (alternatives.some((c) => c.state === "match")) push(label, "match");
    else if (alternatives.some((c) => c.state === "unknown")) push(label, "unknown");
    else push(label, "fail");
  }

  if (rules.occupations?.length) {
    const label = `Occupation: ${rules.occupations.join(" or ")}`;
    if (!profile.occupation) push(label, "unknown");
    else push(label, rules.occupations.includes(profile.occupation) ? "match" : "fail");
  }

  if (rules.education?.length) {
    const label = `Education: ${rules.education.join(" or ")}`;
    if (!profile.education) push(label, "unknown");
    else push(label, rules.education.includes(profile.education) ? "match" : "fail");
  }

  if (rules.student === true) {
    const label = "Currently studying";
    if (profile.is_student == null) push(label, "unknown");
    else push(label, profile.is_student ? "match" : "fail");
  }

  if (rules.farmer === true) {
    const label = "Farmer or agricultural household";
    if (profile.is_farmer == null) push(label, "unknown");
    else push(label, profile.is_farmer ? "match" : "fail");
  }

  if (rules.disability === true) {
    const label = "Person with certified disability";
    if (profile.has_disability == null) push(label, "unknown");
    else push(label, profile.has_disability ? "match" : "fail");
  }

  const matched = checks.filter((c) => c.state === "match").map((c) => c.label);
  const missing = checks.filter((c) => c.state === "fail").map((c) => c.label);
  const unknown = checks.filter((c) => c.state === "unknown").map((c) => c.label);

  const status: EligibilityStatus =
    missing.length > 0 ? "not_eligible" : unknown.length > 0 ? "potentially_eligible" : "eligible";

  const total = checks.length || 1;
  const score = Math.round(((matched.length + unknown.length * 0.4) / total) * 100);

  return { status, matched, missing, unknown, score };
}

export const STATUS_LABEL: Record<EligibilityStatus, string> = {
  eligible: "Eligible",
  potentially_eligible: "Potentially eligible",
  not_eligible: "Not eligible",
};

export const PROFILE_FIELDS = [
  "age",
  "gender",
  "state",
  "district",
  "occupation",
  "annual_income",
  "category",
  "education",
] as const;

export function profileCompletion(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return 0;
  const base = ["full_name", "phone", ...PROFILE_FIELDS];
  const filled = base.filter((key) => {
    const value = profile[key];
    return value !== null && value !== undefined && value !== "";
  }).length;
  return Math.round((filled / base.length) * 100);
}
