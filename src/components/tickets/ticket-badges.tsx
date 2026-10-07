import type { TicketCategory, TicketPriority, TicketStatus } from "@/db/schema";
import { priorityLabel, statusLabel } from "@/lib/ticket-labels";

const STATUS_STYLES: Record<TicketStatus, string> = {
  open: "bg-blue-soft text-blue ring-blue/25",
  in_progress: "bg-amber-soft text-amber ring-amber/25",
  resolved: "bg-green-soft text-green ring-green/25",
  closed: "bg-sunken text-mute ring-line",
};

const PRIORITY_DOTS: Record<TicketPriority, string> = {
  low: "bg-mute",
  medium: "bg-blue",
  high: "bg-accent",
  critical: "bg-danger",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className="sr-only">Status: </span>
      {statusLabel(status)}
    </span>
  );
}

export function PriorityIndicator({ priority }: { priority: TicketPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2">
      <span aria-hidden className={`h-2 w-2 rounded-full ${PRIORITY_DOTS[priority]}`} />
      {priorityLabel(priority)}
      <span className="sr-only"> priority</span>
    </span>
  );
}

export function CategoryPill({ category }: { category: TicketCategory }) {
  return (
    <span className="inline-flex items-center rounded-md bg-sunken px-2 py-0.5 text-xs font-medium capitalize text-ink-2">
      {category}
    </span>
  );
}
