import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Compass } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({
        to: "/sign-in",
        search: { redirect: router.state.location.pathname },
      });
    }
  }, [loading, user, router]);

  if (loading || !user) {
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
