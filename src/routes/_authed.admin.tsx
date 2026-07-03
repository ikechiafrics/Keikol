import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminLayout,
});

const ADMIN_NAV_LINKS = [
  { label: "Overview", to: "/admin" },
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Billboards", to: "/admin/billboards" },
  { label: "Quotes", to: "/admin/quotes" },
  { label: "Audit Log", to: "/admin/audit-log" },
] as const;

function AdminNav() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-32 lg:px-8 lg:pt-40">
      <nav className="flex flex-wrap gap-2 rounded-2xl bg-card-premium p-2 shadow-elegant ring-hairline">
        {ADMIN_NAV_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            activeOptions={{ exact: l.to === "/admin" }}
            activeProps={{ className: "bg-gold text-primary-foreground shadow-gold" }}
            inactiveProps={{
              className: "text-muted-foreground hover:bg-surface hover:text-foreground",
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function AdminLayout() {
  const { isAdmin, loading, profileLoading } = useAuth();
  const router = useRouter();
  const resolved = !loading && !profileLoading;

  useEffect(() => {
    if (resolved && !isAdmin) {
      toast.error("You don't have access to that page.");
      router.navigate({ to: "/dashboard" });
    }
  }, [resolved, isAdmin, router]);

  if (!resolved || !isAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center text-muted-foreground">
          <Compass className="mx-auto h-8 w-8 animate-pulse text-gold" />
          <p className="mt-3 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNav />
      <Outlet />
    </>
  );
}
