import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalDate } from "@/components/local-date";
import {
  CategoryPill,
  PriorityIndicator,
  StatusBadge,
} from "@/components/tickets/ticket-badges";
import type { SenderType } from "@/db/schema";
import { requireStaffPage } from "@/lib/session";
import {
  getStaffTicketDetail,
  listStaffMembers,
  type StaffThreadMessage,
  type StaffTicket,
  type StaffTicketCustomer,
} from "@/lib/staff-tickets";
import { acceptsReplies, parseTicketId } from "@/lib/tickets";
import { StaffReplyForm } from "./staff-reply-form";
import { TicketControls } from "./ticket-controls";

export async function generateMetadata({
  params,
}: PageProps<"/admin/tickets/[id]">): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Ticket #${id} | Staff dashboard`,
    robots: { index: false, follow: false },
  };
}

export default async function StaffTicketPage({
  params,
}: PageProps<"/admin/tickets/[id]">) {
  await requireStaffPage();
  const ticketId = parseTicketId((await params).id);
  if (!ticketId) notFound();
  const [detail, staff] = await Promise.all([
    getStaffTicketDetail(ticketId),
    listStaffMembers(),
  ]);
  if (!detail) notFound();
  const { ticket, customer, messages } = detail;

  return (
    <main className="flex-1 bg-paper px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin"
          className="text-sm font-medium text-mute hover:text-ink"
        >
          ← Back to dashboard
        </Link>

        <TicketSummary ticket={ticket} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="min-w-0 space-y-4">
            <section
              aria-label="Conversation"
              className="space-y-4 rounded-card bg-card p-5 ring-1 ring-line"
            >
              <h2 className="text-lg font-semibold text-ink">Conversation</h2>
              {messages.length === 0 ? (
                <p className="text-center text-sm text-mute">No messages yet.</p>
              ) : (
                messages.map((message) => (
                  <TranscriptMessage
                    key={message.id}
                    message={message}
                    customerName={customer.name}
                  />
                ))
              )}
            </section>
            <StaffReplyForm
              ticketId={ticket.id}
              acceptsReplies={acceptsReplies(ticket.status)}
            />
          </div>

          <div className="space-y-6">
            <TicketControls ticket={ticket} staff={staff} />
            <CustomerProfile customer={customer} />
          </div>
        </div>
      </div>
    </main>
  );
}

function TicketSummary({ ticket }: { ticket: StaffTicket }) {
  return (
    <header className="mt-4 rounded-card bg-card p-5 ring-1 ring-line">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-mute">Ticket #{ticket.id}</p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight wrap-break-word text-ink">
            {ticket.subject}
          </h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <CategoryPill category={ticket.category} />
        <PriorityIndicator priority={ticket.priority} />
        <span className="text-xs text-mute">
          <LocalDate date={ticket.createdAt} prefix="Opened " withTime />
        </span>
        <span className="text-xs text-mute">
          <LocalDate date={ticket.updatedAt} prefix="Updated " withTime />
        </span>
      </div>
      <div className="mt-4 rounded-control bg-paper p-4">
        <h2 className="type-meta">
          Escalation reason
        </h2>
        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm text-ink-2">
          {ticket.escalationReason ?? "No reason was recorded."}
        </p>
      </div>
    </header>
  );
}

function CustomerProfile({ customer }: { customer: StaffTicketCustomer }) {
  return (
    <aside
      aria-label="Customer"
      className="h-fit rounded-card bg-card p-5 ring-1 ring-line"
    >
      <h2 className="type-meta">
        Customer
      </h2>
      <p className="mt-2 font-semibold wrap-break-word text-ink">{customer.name}</p>
      <a
        href={`mailto:${customer.email}`}
        className="text-sm break-all text-mute hover:text-ink hover:underline"
      >
        {customer.email}
      </a>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-mute">Registered</dt>
          <dd className="font-medium text-ink">
            <LocalDate date={customer.createdAt} />
          </dd>
        </div>
        <div>
          <dt className="text-mute">Previous tickets</dt>
          <dd className="font-medium text-ink">
            {customer.previousTicketCount}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

// System messages render as centred notes rather than bubbles.
const BUBBLES: Record<Exclude<SenderType, "system">, string> = {
  customer: "rounded-bl-md bg-sunken text-ink",
  ai: "rounded-br-md bg-card text-ink-2 ring-1 ring-line",
  agent: "rounded-br-md bg-blue-soft text-ink ring-1 ring-blue/20",
};

// Internal notes stand out so an agent never mistakes one for something the
// customer saw.
const INTERNAL_NOTE_BUBBLE =
  "rounded-br-md bg-amber-soft text-ink ring-1 ring-amber/25";

function senderLabel(message: StaffThreadMessage, customerName: string): string {
  if (message.senderType === "customer") return customerName;
  if (message.senderType === "ai") return "AI assistant";
  return message.senderName ?? "Support agent";
}

// From the agent's side the customer is the other party, so their messages
// sit on the left and replies from our side (AI and agents) on the right.
function TranscriptMessage({
  message,
  customerName,
}: {
  message: StaffThreadMessage;
  customerName: string;
}) {
  if (message.senderType === "system") {
    return (
      <p className="text-center text-xs text-mute">{message.content}</p>
    );
  }

  const fromCustomer = message.senderType === "customer";
  const label = senderLabel(message, customerName);
  const bubble = message.isInternal
    ? INTERNAL_NOTE_BUBBLE
    : BUBBLES[message.senderType];

  return (
    <div className={`flex flex-col ${fromCustomer ? "items-start" : "items-end"}`}>
      <p className="mb-1 flex flex-wrap items-center gap-2 px-1 text-xs text-mute">
        {message.isInternal && (
          <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber ring-1 ring-amber/30">
            Internal Note - Only Staff Can See
          </span>
        )}
        <span className="font-medium text-ink-2">{label}</span>
        <LocalDate date={message.createdAt} withTime />
      </p>
      <div
        className={`max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-card px-4 py-3 text-sm sm:max-w-[75%] ${bubble}`}
      >
        {message.content}
      </div>
    </div>
  );
}
