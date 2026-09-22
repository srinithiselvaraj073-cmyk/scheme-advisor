import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountNav } from "@/components/account-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES, INDIAN_STATES } from "@/lib/constants";
import { getMyAccount } from "@/lib/user.functions";
import {
  adminDeleteScheme,
  adminListMessages,
  adminListSchemes,
  adminListUsers,
  adminSaveScheme,
  adminSetUserRole,
  adminToggleSchemeStatus,
  adminUpdateMessage,
  getAdminOverview,
  type SchemeInput,
} from "@/lib/admin.functions";
import type { Scheme } from "@/lib/schemes.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Sri Scheme Finder" },
      { name: "description", content: "Manage schemes, users and contact messages." },
      { property: "og:title", content: "Admin Dashboard — Sri Scheme Finder" },
      { property: "og:description", content: "Scheme, user and message management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const EMPTY_SCHEME: SchemeInput = {
  name: "",
  slug: "",
  level: "central",
  state: null,
  category: "Agriculture",
  department: "",
  description: "",
  benefits: [],
  eligibility_rules: {},
  eligibility_notes: [],
  documents: [],
  application_process: [],
  beneficiary_type: [],
  official_source: "",
  official_website: "",
  official_application_url: "",
  last_verified_date: new Date().toISOString().slice(0, 10),
  status: "active",
};

const lines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function SchemeDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Scheme | null;
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(adminSaveScheme);
  const [form, setForm] = useState<SchemeInput>(
    initial
      ? {
          id: initial.id,
          name: initial.name,
          slug: initial.slug,
          level: initial.level as "central" | "state",
          state: initial.state,
          category: initial.category,
          department: initial.department,
          description: initial.description,
          benefits: initial.benefits,
          eligibility_rules: (initial.eligibility_rules ?? {}) as Record<string, unknown>,
          eligibility_notes: initial.eligibility_notes,
          documents: initial.documents,
          application_process: initial.application_process,
          beneficiary_type: initial.beneficiary_type,
          official_source: initial.official_source,
          official_website: initial.official_website,
          official_application_url: initial.official_application_url,
          last_verified_date: initial.last_verified_date,
          status: initial.status as "active" | "inactive",
        }
      : EMPTY_SCHEME,
  );
  const [rulesText, setRulesText] = useState(
    JSON.stringify(initial?.eligibility_rules ?? {}, null, 2),
  );

  const mutation = useMutation({
    mutationFn: () => {
      let rules: Record<string, unknown>;
      try {
        rules = JSON.parse(rulesText || "{}");
      } catch {
        throw new Error("Eligibility rules must be valid JSON.");
      }
      return save({ data: { ...form, eligibility_rules: rules } });
    },
    onSuccess: () => {
      toast.success("Scheme saved");
      queryClient.invalidateQueries({ queryKey: ["admin-schemes"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const set = <K extends keyof SchemeInput>(key: K, value: SchemeInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit scheme" : "Add scheme"}</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label>Scheme name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Slug (URL)</Label>
            <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label>Government level</Label>
            <Select
              value={form.level}
              onValueChange={(v) => set("level", v as "central" | "state")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="state">State</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.level === "state" ? (
            <div className="grid gap-2">
              <Label>State</Label>
              <Select value={form.state ?? ""} onValueChange={(v) => set("state", v)}>
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
          ) : null}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Department</Label>
            <Input
              value={form.department ?? ""}
              onChange={(e) => set("department", e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Benefits (one per line)</Label>
            <Textarea
              rows={4}
              value={form.benefits.join("\n")}
              onChange={(e) => set("benefits", lines(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Eligibility notes (one per line)</Label>
            <Textarea
              rows={4}
              value={form.eligibility_notes.join("\n")}
              onChange={(e) => set("eligibility_notes", lines(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Required documents (one per line)</Label>
            <Textarea
              rows={4}
              value={form.documents.join("\n")}
              onChange={(e) => set("documents", lines(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Application steps (one per line)</Label>
            <Textarea
              rows={4}
              value={form.application_process.join("\n")}
              onChange={(e) => set("application_process", lines(e.target.value))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Beneficiary types (one per line)</Label>
            <Textarea
              rows={3}
              value={form.beneficiary_type.join("\n")}
              onChange={(e) => set("beneficiary_type", lines(e.target.value))}
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label>Eligibility rules (JSON used by the checker)</Label>
            <Textarea
              rows={6}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Supported keys: min_age, max_age, gender[], max_income, categories[], states[],
              occupations[], education[], student, farmer, disability, match_any.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Official source</Label>
            <Input
              value={form.official_source ?? ""}
              onChange={(e) => set("official_source", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Last verified date</Label>
            <Input
              type="date"
              value={form.last_verified_date ?? ""}
              onChange={(e) => set("last_verified_date", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Official website</Label>
            <Input
              value={form.official_website ?? ""}
              onChange={(e) => set("official_website", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Official application URL</Label>
            <Input
              value={form.official_application_url ?? ""}
              onChange={(e) => set("official_application_url", e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 sm:col-span-2">
            <Label htmlFor="status">Active (visible to the public)</Label>
            <Switch
              id="status"
              checked={form.status === "active"}
              onCheckedChange={(v) => set("status", v ? "active" : "inactive")}
            />
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="surface-brand border-0" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save scheme
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const fetchOverview = useServerFn(getAdminOverview);
  const fetchSchemes = useServerFn(adminListSchemes);
  const fetchUsers = useServerFn(adminListUsers);
  const fetchMessages = useServerFn(adminListMessages);
  const toggleStatus = useServerFn(adminToggleSchemeStatus);
  const removeScheme = useServerFn(adminDeleteScheme);
  const setRole = useServerFn(adminSetUserRole);
  const updateMessage = useServerFn(adminUpdateMessage);

  const account = useQuery({ queryKey: ["my-account"], queryFn: () => fetchAccount() });
  const isAdmin = account.data?.isAdmin ?? false;

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: isAdmin,
  });
  const schemes = useQuery({
    queryKey: ["admin-schemes"],
    queryFn: () => fetchSchemes(),
    enabled: isAdmin,
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
    enabled: isAdmin,
  });
  const messages = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => fetchMessages(),
    enabled: isAdmin,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Scheme | null>(null);

  const invalidateSchemes = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-schemes"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    queryClient.invalidateQueries({ queryKey: ["schemes"] });
  };

  if (account.isPending) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShieldAlert className="mx-auto size-10 text-warning" />
        <h1 className="mt-5 font-display text-2xl font-semibold">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account does not have the admin role. Ask an existing admin to grant it from the admin
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Admin dashboard</h1>
        <AccountNav isAdmin />
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Users", value: overview.data?.users },
          { label: "Schemes", value: overview.data?.schemes },
          { label: "Active", value: overview.data?.activeSchemes },
          { label: "Saved", value: overview.data?.savedSchemes },
          { label: "Messages", value: overview.data?.messages },
          { label: "New messages", value: overview.data?.newMessages },
        ].map((stat) => (
          <div
            key={stat.label}
            className="surface-card rounded-2xl border border-border/70 px-4 py-5"
          >
            <p className="font-display text-2xl font-semibold">
              {overview.isPending ? "…" : (stat.value ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="schemes" className="mt-10">
        <TabsList>
          <TabsTrigger value="schemes">Schemes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="schemes" className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {schemes.data?.length ?? 0} schemes in the database
            </p>
            <Button
              className="surface-brand border-0"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add scheme
            </Button>
          </div>

          <div className="surface-card mt-4 overflow-x-auto rounded-2xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemes.isPending ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading schemes…</TableCell>
                  </TableRow>
                ) : (
                  (schemes.data ?? []).map((scheme) => (
                    <TableRow key={scheme.id}>
                      <TableCell className="max-w-sm">
                        <span className="line-clamp-1 font-medium">{scheme.name}</span>
                        <span className="text-xs text-muted-foreground">{scheme.slug}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {scheme.level === "central" ? "Central" : scheme.state}
                      </TableCell>
                      <TableCell className="text-xs">{scheme.category}</TableCell>
                      <TableCell>
                        <Switch
                          checked={scheme.status === "active"}
                          onCheckedChange={async (value) => {
                            try {
                              await toggleStatus({
                                data: { id: scheme.id, status: value ? "active" : "inactive" },
                              });
                              invalidateSchemes();
                            } catch (error) {
                              toast.error((error as Error).message);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit scheme"
                            onClick={() => {
                              setEditing(scheme);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete scheme"
                            onClick={async () => {
                              if (!confirm(`Delete "${scheme.name}"?`)) return;
                              try {
                                await removeScheme({ data: { id: scheme.id } });
                                toast.success("Scheme deleted");
                                invalidateSchemes();
                              } catch (error) {
                                toast.error((error as Error).message);
                              }
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="surface-card overflow-x-auto rounded-2xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.isPending ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading users…</TableCell>
                  </TableRow>
                ) : (users.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No users yet.</TableCell>
                  </TableRow>
                ) : (
                  users.data!.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.full_name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{user.email ?? "—"}</TableCell>
                      <TableCell className="text-xs">{user.state ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role: string) => (
                            <Badge key={role} variant="secondary">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={user.roles.includes("admin")}
                          onCheckedChange={async (value) => {
                            try {
                              await setRole({
                                data: { userId: user.id, role: "admin", grant: value },
                              });
                              toast.success("Role updated");
                              queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                            } catch (error) {
                              toast.error((error as Error).message);
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <div className="space-y-4">
            {messages.isPending ? (
              <Skeleton className="h-32 rounded-2xl" />
            ) : (messages.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No contact messages yet.</p>
            ) : (
              messages.data!.map((message) => (
                <article
                  key={message.id}
                  className="surface-card rounded-2xl border border-border/70 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{message.subject || "No subject"}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.name} · {message.email} ·{" "}
                        {new Date(message.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Select
                      value={message.status}
                      onValueChange={async (value) => {
                        try {
                          await updateMessage({
                            data: { id: message.id, status: value as "new" | "read" | "resolved" },
                          });
                          queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
                          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
                        } catch (error) {
                          toast.error((error as Error).message);
                        }
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{message.message}</p>
                </article>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {dialogOpen ? (
        <SchemeDialog
          key={editing?.id ?? "new"}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initial={editing}
        />
      ) : null}
    </div>
  );
}
