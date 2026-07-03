import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Section, SectionHeader } from "@/components";
import { db } from "@/lib/firebase";
import { useQuoteRequests } from "@/lib/quotes-data";
import { QUOTE_STATUS_CLASSES, type QuoteRequest } from "@/lib/quote-types";
import type { QuoteStatus } from "@/lib/quote-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authed/admin/quotes")({
  head: () => ({
    meta: [{ title: "Admin — Quotes — Keikol" }],
  }),
  component: AdminQuotesPage,
});

const STATUS_OPTIONS: QuoteStatus[] = ["new", "contacted", "closed"];

async function updateQuoteStatus(quote: QuoteRequest, status: QuoteStatus) {
  await updateDoc(doc(db, "quoteRequests", quote.id), { status, updatedAt: serverTimestamp() });
}

async function deleteQuoteRequest(id: string) {
  await deleteDoc(doc(db, "quoteRequests", id));
}

function AdminQuotesPage() {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<QuoteRequest | null>(null);

  const { data: quotes, isLoading } = useQuoteRequests();

  const statusMutation = useMutation({
    mutationFn: ({ quote, status }: { quote: QuoteRequest; status: QuoteStatus }) => updateQuoteStatus(quote, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-quotes"] }),
    onError: () => toast.error("Couldn't update this quote's status. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuoteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast.success("Quote request deleted.");
      setPendingDelete(null);
    },
    onError: () => toast.error("Couldn't delete this quote request. Please try again."),
  });

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={<>Manage <span className="text-gradient-gold">Quote Requests</span></>}
        subtitle="Review and follow up on billboard advertising quote requests submitted from the site."
      />

      <div className="mt-10 overflow-x-auto rounded-2xl bg-card-premium shadow-elegant ring-hairline">
        {isLoading && <p className="p-6 text-sm text-muted-foreground">Loading quote requests…</p>}

        {!isLoading && (!quotes || quotes.length === 0) && (
          <p className="p-6 text-sm text-muted-foreground">No quote requests yet.</p>
        )}

        {!isLoading && quotes && quotes.length > 0 && (
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Submitted</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Interested Billboard</th>
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Message</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((qte) => {
                const classes = QUOTE_STATUS_CLASSES[qte.status];
                return (
                  <tr key={qte.id} className="border-b border-border align-top last:border-0">
                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {qte.createdAt ? qte.createdAt.toDate().toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{qte.name}</p>
                      {qte.company && <p className="text-xs text-muted-foreground">{qte.company}</p>}
                      <p className="text-xs text-muted-foreground">{qte.email}</p>
                      <p className="text-xs text-muted-foreground">{qte.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p>{qte.interestedBillboard}</p>
                      {qte.city && <p className="text-xs">{qte.city}</p>}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <p>{qte.budget}</p>
                      <p className="text-xs">{qte.duration}</p>
                      <p className="text-xs">{qte.goal}</p>
                    </td>
                    <td className="max-w-xs px-5 py-4">
                      <p className="line-clamp-3 text-muted-foreground" title={qte.message}>{qte.message}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${classes.dot}`} />
                        <select
                          value={qte.status}
                          disabled={statusMutation.isPending && statusMutation.variables?.quote.id === qte.id}
                          onChange={(e) => statusMutation.mutate({ quote: qte, status: e.target.value as QuoteStatus })}
                          className={`rounded-lg border border-border bg-background/60 px-2 py-1 text-xs font-semibold ${classes.text}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{QUOTE_STATUS_CLASSES[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setPendingDelete(qte)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quote request from "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the quote request. Use this to clear spam or duplicate submissions. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}
