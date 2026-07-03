import type { Timestamp } from "firebase/firestore";
import type { StatusBadgeClasses } from "@/lib/status-badge";

export interface InvoiceBookingSnapshot {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  billboardCity: string;
  billboardArea: string;
  billboardType: string;
  billboardSize: string;
  campaignStartDate: string;
  campaignEndDate: string;
  campaignDuration: string;
  campaignGoal: string;
}

export type InvoiceStatus = "unpaid" | "paid";

export interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate?: string;
  issuedAt: Timestamp | null;
  paidAt: Timestamp | null;
  bookingSnapshot: InvoiceBookingSnapshot;
}

export const INVOICE_STATUS_CLASSES: Record<InvoiceStatus, StatusBadgeClasses> = {
  unpaid: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20", label: "Unpaid" },
  paid: { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-500/20", label: "Paid" },
};
