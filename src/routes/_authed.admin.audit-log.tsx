import { createFileRoute } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/lib/audit-log";

export const Route = createFileRoute("/_authed/admin/audit-log")({
  head: () => ({
    meta: [{ title: "Admin — Audit Log — Keikol" }],
  }),
  component: AdminAuditLogPage,
});

function AdminAuditLogPage() {
  const { data: logs, isLoading } = useAuditLogs();

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            Audit <span className="text-gradient-gold">Log</span>
          </>
        }
        subtitle="A read-only, permanent record of admin actions across the site — who did what, and when."
      />

      <div className="mt-10 overflow-x-auto rounded-2xl bg-card-premium shadow-elegant ring-hairline">
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!logs || logs.length === 0) && (
          <div className="p-10 text-center">
            <ScrollText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              No admin actions have been logged yet.
            </p>
          </div>
        )}

        {!isLoading && logs && logs.length > 0 && (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">When</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border align-top last:border-0">
                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {log.createdAt ? log.createdAt.toDate().toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{log.actorEmail || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
}
