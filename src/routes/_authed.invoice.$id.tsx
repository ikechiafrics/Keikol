import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Printer } from "lucide-react";

import { Section } from "@/components";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { formatNaira } from "@/lib/invoice";
import type { Invoice } from "@/lib/invoice-types";
import keikolMark from "@/assets/Logo.png";

export const Route = createFileRoute("/_authed/invoice/$id")({
  head: () => ({
    meta: [{ title: "Invoice — Keikol" }],
  }),
  component: InvoicePage,
});

async function fetchInvoice(id: string): Promise<Invoice> {
  const snap = await getDoc(doc(db, "invoices", id));
  if (!snap.exists()) throw new Error("not-found");
  return { id: snap.id, ...snap.data() } as Invoice;
}

function InvoicePage() {
  const { id } = Route.useParams();
  const { isAdmin } = useAuth();
  const {
    data: invoice,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchInvoice(id),
  });

  if (isLoading) {
    return (
      <Section>
        <p className="text-sm text-muted-foreground">Loading invoice…</p>
      </Section>
    );
  }

  if (isError || !invoice) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface/40 p-10 text-center">
          <h1 className="font-display text-xl font-bold">You don't have access to this invoice</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invoice doesn't exist, or you don't have permission to view it.
          </p>
        </div>
      </Section>
    );
  }

  const issuedDate = invoice.issuedAt?.toDate().toLocaleDateString() ?? "—";
  const paid = invoice.status === "paid";
  const b = invoice.bookingSnapshot;

  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        {isAdmin ? (
          <Link
            to="/admin/bookings"
            className="print:hidden mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
        ) : (
          <Link
            to="/invoices/$bookingId"
            params={{ bookingId: invoice.bookingId }}
            className="print:hidden mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Link>
        )}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-elegant sm:p-12">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={keikolMark} alt="Keikol" className="h-12 w-12 rounded-xl" />
              <div>
                <h1 className="font-display text-2xl font-extrabold text-black">
                  Keikol Media Ltd
                </h1>
                <p className="mt-1 text-sm text-black">Nigeria</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-xl font-bold uppercase tracking-widest text-gold">
                Invoice
              </p>
              <p className="mt-1 font-mono text-sm text-black">{invoice.invoiceNumber}</p>
              <p className="mt-1 text-xs text-black">Issued {issuedDate}</p>
              {invoice.dueDate && <p className="text-xs text-black">Due {invoice.dueDate}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                paid ? "bg-green-500/20 text-green-600" : "bg-gold/20 text-gold"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-green-500" : "bg-gold"}`} />
              {paid ? "Paid" : "Unpaid"}
            </span>
            <button
              onClick={() => window.print()}
              className="print:hidden inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-black hover:border-gold hover:text-gold"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
            </button>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-black">Bill To</p>
              <p className="mt-2 text-sm font-semibold text-black">{b.companyName || "—"}</p>
              <p className="text-sm text-black">{b.contactEmail}</p>
              <p className="text-sm text-black">{b.contactPhone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-black">Campaign</p>
              <p className="mt-2 text-sm font-semibold text-black">
                {b.billboardArea}, {b.billboardCity}
              </p>
              <p className="text-sm text-black">
                {b.billboardType} · {b.billboardSize}
              </p>
              <p className="text-sm text-black">
                {b.campaignStartDate} – {b.campaignEndDate} ({b.campaignDuration})
              </p>
              <p className="text-sm text-black">Goal: {b.campaignGoal}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200">
            <p className="font-display text-sm font-bold uppercase tracking-widest text-black">
              Amount Due
            </p>
            <p className="font-display text-2xl font-extrabold text-gold">
              {formatNaira(invoice.amount)}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
