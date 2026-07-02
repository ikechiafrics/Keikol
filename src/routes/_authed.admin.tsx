import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed/admin")({
  component: AdminLayout,
});

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

  return <Outlet />;
}
