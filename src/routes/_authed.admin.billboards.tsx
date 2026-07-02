import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/admin/billboards")({
  component: () => <Outlet />,
});
