import type { Metadata } from "next";
import Link from "next/link";
import { LocalDate } from "@/components/local-date";
import { SignOutButton } from "@/components/sign-out-button";
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

  return (
    <main className="flex-1 bg-paper px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="type-title">Support Dashboard</h1>
            <p className="mt-1 text-sm text-mute">
              Signed in as {user.name} ({user.role}).
            </p>
          </div>
          <SignOutButton redirectTo="/admin/login" />
        </div>

        <MetricCards metrics={metrics} />

        <section className="mt-6 overflow-hidden rounded-card bg-card ring-1 ring-line">
          <div className="flex flex-col gap-4 border-b border-line p-5 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="text-lg font-semibold text-ink">Tickets</h2>
            <FilterForm filters={filters} />
          </div>
          {queue.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-mute">
              {Object.keys(filters).length > 0
                ? "No tickets match these filters."
                : "No tickets yet."}
            </p>
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
    { label: "Total Tickets", value: metrics.total },
    { label: "Open Tickets", value: metrics.open },
    { label: "High/Critical Tickets", value: metrics.highOrCritical },
    { label: "Resolved Tickets", value: metrics.resolved },
  ];
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-card bg-card p-5 ring-1 ring-line"
        >
          <dt className="text-sm text-mute">{label}</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-ink">{value}</dd>
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
      <button
        type="submit"
        className="btn btn-primary h-10 px-4 text-sm"
      >
        Apply
      </button>
      <Link
        href="/admin"
        className="rounded-control px-3 py-2 text-sm font-medium text-mute hover:bg-sunken"
      >
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
    <label className="flex flex-col gap-1 text-xs font-medium text-mute">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="field px-3 py-2"
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

function QueueTable({ tickets }: { tickets: QueueTicket[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-paper type-meta">
          <tr>
            <th className="px-5 py-3 font-medium">Ticket</th>
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Category</th>
            <th className="px-5 py-3 font-medium">Priority</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tickets.map((ticket) => (
            // The subject link stretches over the whole row, so any cell opens
            // the ticket.
            <tr key={ticket.id} className="relative hover:bg-paper">
              <td className="max-w-xs px-5 py-3">
                <p className="text-xs text-mute">#{ticket.id}</p>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="block truncate font-medium text-ink after:absolute after:inset-0"
                >
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-5 py-3">
                <p className="font-medium text-ink">{ticket.customerName}</p>
                <p className="text-mute">{ticket.customerEmail}</p>
              </td>
              <td className="px-5 py-3">
                <CategoryPill category={ticket.category} />
              </td>
              <td className="px-5 py-3">
                <PriorityIndicator priority={ticket.priority} />
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-mute">
                <LocalDate date={ticket.createdAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
