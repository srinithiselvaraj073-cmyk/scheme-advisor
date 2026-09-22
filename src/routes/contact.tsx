import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/schemes.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Sri Scheme Finder" },
      {
        name: "description",
        content:
          "Send a message to the Sri Scheme Finder team to report outdated scheme information or suggest a scheme to add.",
      },
      { property: "og:title", content: "Contact — Sri Scheme Finder" },
      {
        property: "og:description",
        content: "Report outdated scheme details or suggest a new scheme for the platform.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const send = useServerFn(submitContactMessage);

  const mutation = useMutation({
    mutationFn: () => send({ data: form }),
    onSuccess: () => {
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      toast.success("Message sent. Thank you!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Contact us</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Found a scheme detail that looks outdated, or know a scheme we should add? Tell us and the
          team will verify it against the official portal.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="surface-card rounded-2xl border border-border/70 p-6 text-sm text-muted-foreground">
          <Mail className="size-5 text-accent" />
          <h2 className="mt-3 font-display text-base font-semibold text-foreground">
            What to include
          </h2>
          <ul className="mt-3 space-y-2">
            <li>• The scheme name</li>
            <li>• What looks incorrect</li>
            <li>• A link to the official page, if you have one</li>
          </ul>
        </div>

        <form
          className="surface-card rounded-2xl border border-border/70 p-6 lg:col-span-2"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {sent ? (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="size-4" />
              Your message reached our team.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g. Outdated income limit"
            />
          </div>

          <div className="mt-4 grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="surface-brand mt-6 border-0"
            size="lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageSquare className="size-4" />
            )}
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}
