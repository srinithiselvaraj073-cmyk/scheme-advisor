import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Scheme } from "./schemes.functions";
import type { Profile } from "./user.functions";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin access required.");
}

export type SchemeInput = {
  id?: string;
  name: string;
  slug: string;
  level: "central" | "state";
  state?: string | null;
  category: string;
  department?: string | null;
  description: string;
  benefits: string[];
  eligibility_rules: Record<string, unknown>;
  eligibility_notes: string[];
  documents: string[];
  application_process: string[];
  beneficiary_type: string[];
  official_source?: string | null;
  official_website?: string | null;
  official_application_url?: string | null;
  last_verified_date?: string | null;
  status: "active" | "inactive";
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabase } = context;

    const [users, schemes, activeSchemes, saved, messages, newMessages] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("schemes").select("id", { count: "exact", head: true }),
      supabase.from("schemes").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("saved_schemes").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
    ]);

    return {
      users: users.count ?? 0,
      schemes: schemes.count ?? 0,
      activeSchemes: activeSchemes.count ?? 0,
      savedSchemes: saved.count ?? 0,
      messages: messages.count ?? 0,
      newMessages: newMessages.count ?? 0,
    };
  });

export const adminListSchemes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("schemes")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Scheme[];
  });

export const adminSaveScheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SchemeInput) => {
    if (!data.name?.trim()) throw new Error("Scheme name is required.");
    if (!data.slug?.trim()) throw new Error("Slug is required.");
    if (!data.description?.trim()) throw new Error("Description is required.");
    if (data.level === "state" && !data.state) throw new Error("State schemes need a state.");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...payload } = data;
    const row = {
      ...payload,
      state: payload.level === "central" ? null : (payload.state ?? null),
      department: payload.department ?? null,
      official_source: payload.official_source ?? null,
      official_website: payload.official_website ?? null,
      official_application_url: payload.official_application_url ?? null,
      last_verified_date: payload.last_verified_date ?? null,
      eligibility_rules: payload.eligibility_rules as never,
    } as never;

    if (id) {
      const { data: updated, error } = await context.supabase
        .from("schemes")
        .update(row)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw new Error(error.message);
      return updated as Scheme;
    }

    const { data: inserted, error } = await context.supabase
      .from("schemes")
      .insert(row)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return inserted as Scheme;
  });

export const adminToggleSchemeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "inactive" }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("schemes")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteScheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("schemes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (error) throw new Error(error.message);

    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    return (profiles ?? []).map((p: Profile) => ({
      ...p,
      roles: roleMap.get(p.id) ?? ["user"],
    }));
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "user" | "admin"; grant: boolean }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Role changes run through a security-definer database function that checks
    // the caller is an admin, so no privileged service key is needed anywhere.
    const { error } = await context.supabase.rpc("admin_set_user_role", {
      _user_id: data.userId,
      _role: data.role,
      _grant: data.grant,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "new" | "read" | "resolved" }) => data)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
