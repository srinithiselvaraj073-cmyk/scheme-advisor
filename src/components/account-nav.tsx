import { Link } from "@tanstack/react-router";
import { Bookmark, LayoutDashboard, Shield, UserCog } from "lucide-react";

export function AccountNav({ isAdmin }: { isAdmin?: boolean | undefined }) {
  const items = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/saved", label: "Saved Schemes", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: UserCog },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="inline-flex items-center gap-2 rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          activeProps={{ className: "border-primary text-foreground bg-secondary" }}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
