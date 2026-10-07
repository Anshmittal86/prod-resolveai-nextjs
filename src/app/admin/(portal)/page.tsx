import type { Metadata } from "next";
import Link from "next/link";
import { LocalDate } from "@/components/local-date";
import {
  CategoryPill,
  PriorityIndicator,
  StatusBadge,
} from "@/components/tickets/ticket-badges";
import { categoryLabel, priorityLabel, statusLabel } from "@/lib/ticket-labels";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "@/db/schema";
import { requireStaffPage } from "@/lib/session";
import {
  getQueueMetrics,
  listQueueTickets,
  parseQueueFilters,
  type QueueFilters,
  type QueueMetrics,
  type QueueTicket,
} from "@/lib/staff-tickets";

export const metadata: Metadata = {
  title: "Staff dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireStaffPage();
  const filters = parseQueueFilters(await searchParams);
  const [metrics, queue] = await Promise.all([
    getQueueMetrics(),
    listQueueTickets(filters),
  ]);
  const filtered = Object.keys(filters).length > 0;

  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="eyebrow">Support queue</p>
          <h1 className="type-title mt-3">Support Dashboard</h1>
          <p className="mt-2 text-sm text-mute">
            Signed in as {user.name} ({user.role}).
          </p>
        </div>

        <MetricCards metrics={metrics} />

        <section aria-labelledby="queue-heading" className="card mt-6 overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="queue-heading" className="text-[17px] font-semibold tracking-tight">
                Tickets
              </h2>
              <p className="mt-0.5 text-sm text-mute">
                {queue.length} {queue.length === 1 ? "ticket" : "tickets"}
                {filtered ? " match these filters" : " in the queue"}
              </p>
            </div>
            <FilterForm filters={filters} />
          </div>
          {queue.length === 0 ? (
            <EmptyQueue filtered={filtered} />
          ) : (
            <QueueTable tickets={queue} />
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCards({ metrics }: { metrics: QueueMetrics }) {
  const cards = [
    { label: "Total tickets", value: metrics.total, dot: "bg-ink" },
    { label: "Open", value: metrics.open, dot: "bg-blue" },
    { label: "High or critical", value: metrics.highOrCritical, dot: "bg-accent" },
    { label: "Resolved", value: metrics.resolved, dot: "bg-green" },
  ];
  return (
    <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-4">
      {cards.map(({ label, value, dot }) => (
        <div key={label} className="bg-card px-5 py-5">
          <dt className="type-meta flex items-center gap-2">
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
          </dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// The order agents triage in.
const PRIORITIES_MOST_SEVERE_FIRST = [...TICKET_PRIORITIES].reverse();

// A plain GET form: filters live in the URL, so a filtered view can be
// bookmarked or shared and works without client JavaScript.
function FilterForm({ filters }: { filters: QueueFilters }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <FilterSelect
        name="status"
        label="Status"
        value={filters.status}
        options={TICKET_STATUSES.map((s) => [s, statusLabel(s)])}
      />
      <FilterSelect
        name="priority"
        label="Priority"
        value={filters.priority}
        options={PRIORITIES_MOST_SEVERE_FIRST.map((p) => [p, priorityLabel(p)])}
      />
      <FilterSelect
        name="category"
        label="Category"
        value={filters.category}
        options={TICKET_CATEGORIES.map((c) => [c, categoryLabel(c)])}
      />
      <button type="submit" className="btn btn-primary h-10 px-4 text-sm">
        Apply
      </button>
      <Link href="/admin" className="btn btn-ghost h-10 px-4 text-sm">
        Clear
      </Link>
    </form>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | undefined;
  options: [value: string, label: string][];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="type-meta">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="field h-10 min-w-32 px-3 py-0"
      >
        <option value="">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyQueue({ filtered }: { filtered: boolean }) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="font-medium">{filtered ? "No tickets match these filters." : "No tickets yet."}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-mute">
        {filtered
          ? "Try a different status, priority or category, or clear the filters."
          : "Tickets appear here when the assistant escalates a conversation."}
      </p>
    </div>
  );
}

function QueueTable({ tickets }: { tickets: QueueTicket[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="type-meta border-b border-line bg-paper">
          <tr>
            <th className="px-5 py-3 font-normal">Ticket</th>
            <th className="px-5 py-3 font-normal">Customer</th>
            <th className="px-5 py-3 font-normal">Category</th>
            <th className="px-5 py-3 font-normal">Priority</th>
            <th className="px-5 py-3 font-normal">Status</th>
            <th className="px-5 py-3 font-normal">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tickets.map((ticket) => (
            // The subject link stretches over the whole row, so any cell opens
            // the ticket.
            <tr key={ticket.id} className="relative transition-colors hover:bg-paper">
              <td className="max-w-xs px-5 py-3.5">
                <p className="font-mono text-[11px] text-mute">#{ticket.id}</p>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="block truncate font-medium after:absolute after:inset-0"
                >
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-5 py-3.5">
                <p className="font-medium">{ticket.customerName}</p>
                <p className="text-mute">{ticket.customerEmail}</p>
              </td>
              <td className="px-5 py-3.5">
                <CategoryPill category={ticket.category} />
              </td>
              <td className="px-5 py-3.5">
                <PriorityIndicator priority={ticket.priority} />
              </td>
              <td className="px-5 py-3.5">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-3.5 text-mute">
                <LocalDate date={ticket.createdAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
