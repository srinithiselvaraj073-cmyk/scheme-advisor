import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";

export type Scheme = Database["public"]["Tables"]["schemes"]["Row"];

export type SchemeFilters = {
  search?: string;
  level?: string;
  state?: string;
  category?: string;
  beneficiary?: string;
  page?: number;
  pageSize?: number;
};

const PAGE_SIZE = 12;

export const listSchemes = createServerFn({ method: "GET" })
  .inputValidator((data: SchemeFilters | undefined) => data ?? {})
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();

    const page = Math.max(1, data.page ?? 1);
    const pageSize = Math.min(48, data.pageSize ?? PAGE_SIZE);
    const from = (page - 1) * pageSize;

    let query = supabase
      .from("schemes")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("level", { ascending: true })
      .order("name", { ascending: true });

    if (data.search?.trim()) {
      const term = data.search.trim().replace(/[%,]/g, " ");
      query = query.or(
        `name.ilike.%${term}%,description.ilike.%${term}%,department.ilike.%${term}%,category.ilike.%${term}%`,
      );
    }
    if (data.level && data.level !== "all") query = query.eq("level", data.level);
    if (data.state && data.state !== "all") query = query.eq("state", data.state);
    if (data.category && data.category !== "all") query = query.eq("category", data.category);
    if (data.beneficiary && data.beneficiary !== "all")
      query = query.contains("beneficiary_type", [data.beneficiary]);

    const { data: rows, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);

    return {
      items: (rows ?? []) as Scheme[],
      total: count ?? 0,
      page,
      pageSize,
    };
  });

export const getSchemeBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("schemes")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as Scheme | null;
  });

export const getSchemeStats = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./supabase-public.server");
  const supabase = createPublicClient();
  const { data: rows, error } = await supabase
    .from("schemes")
    .select("level, state, category")
    .eq("status", "active");
  if (error) throw new Error(error.message);

  const list = rows ?? [];
  const categories = new Map<string, number>();
  const states = new Set<string>();
  for (const row of list) {
    categories.set(row.category, (categories.get(row.category) ?? 0) + 1);
    if (row.state) states.add(row.state);
  }

  return {
    total: list.length,
    central: list.filter((r) => r.level === "central").length,
    state: list.filter((r) => r.level === "state").length,
    statesCovered: states.size,
    categories: [...categories.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  };
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; subject?: string; message: string }) => {
    if (!data.name?.trim() || data.name.trim().length > 120) throw new Error("Please enter your name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email ?? "")) throw new Error("Please enter a valid email.");
    if (!data.message?.trim() || data.message.trim().length > 4000)
      throw new Error("Please enter a message (up to 4000 characters).");
    return data;
  })
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./supabase-public.server");
    const supabase = createPublicClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject?.trim() || null,
      message: data.message.trim(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
