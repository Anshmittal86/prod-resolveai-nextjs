"use client";

import { useState, useTransition } from "react";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "@/db/enums";
import type { TicketStatus } from "@/db/schema";
import type {
  StaffMember,
  StaffTicket,
  TicketTriage,
  StaffActionResult,
} from "@/lib/staff-tickets";
import { categoryLabel, priorityLabel, statusLabel } from "@/lib/ticket-labels";
import { changeTicketStatus, triageTicket } from "./actions";

const QUICK_ACTIONS: { status: TicketStatus; label: string; className: string }[] = [
  {
    status: "in_progress",
    label: "Mark in progress",
    className: "bg-amber-soft text-amber ring-amber/25 hover:bg-amber/15",
  },
  {
    status: "resolved",
    label: "Resolve",
    className: "bg-green-soft text-green ring-green/25 hover:bg-green/15",
  },
  {
    status: "closed",
    label: "Close",
    className: "bg-card text-ink-2 ring-line-strong hover:ring-ink",
  },
];

const SELECT_CLASS = "field mt-1.5 h-10 px-3 py-0";

// Every control saves as soon as it is used; the page refreshes with the
// saved values, so the selects stay controlled by the server's copy.
export function TicketControls({
  ticket,
  staff,
}: {
  ticket: Pick<StaffTicket, "id" | "status" | "priority" | "category" | "assignedToId">;
  staff: StaffMember[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Closing is final; priority, category and assignee can still change.
  const closed = ticket.status === "closed";

  function save(update: () => Promise<StaffActionResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await update();
        if (!result.ok) setError(result.error);
      } catch {
        setError("Couldn't save the change. Check your connection and try again.");
      }
    });
  }

  function setStatus(status: TicketStatus) {
    save(() => changeTicketStatus(ticket.id, status));
  }

  function setTriage(changes: TicketTriage) {
    save(() => triageTicket(ticket.id, changes));
  }

  return (
    <section
      aria-label="Manage ticket"
      aria-busy={pending}
      className="card h-fit p-5"
    >
      <h2 className="type-meta">Manage ticket</h2>

      {error && (
        <p
          role="alert"
          className="alert-danger mt-3 px-3"
        >
          {error}
        </p>
      )}

      {closed ? (
        <p className="mt-3 text-xs text-mute">
          This ticket is closed, so its status can no longer change.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.filter(({ status }) => status !== ticket.status).map(
            ({ status, label, className }) => (
              <button
                key={status}
                type="button"
                disabled={pending}
                onClick={() => setStatus(status)}
                className={`btn h-8 px-3 text-xs ring-1 ring-inset ${className}`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      )}

      <div className="mt-5 space-y-4 border-t border-line pt-4 text-sm">
        <label className="block">
          <span className="type-meta">Status</span>
          <select
            value={ticket.status}
            disabled={pending || closed}
            onChange={(event) => setStatus(event.target.value as TicketStatus)}
            className={SELECT_CLASS}
          >
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="type-meta">Priority</span>
          <select
            value={ticket.priority}
            disabled={pending}
            onChange={(event) =>
              setTriage({ priority: event.target.value as TicketTriage["priority"] })
            }
            className={SELECT_CLASS}
          >
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabel(priority)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="type-meta">Category</span>
          <select
            value={ticket.category}
            disabled={pending}
            onChange={(event) =>
              setTriage({ category: event.target.value as TicketTriage["category"] })
            }
            className={SELECT_CLASS}
          >
            {TICKET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="type-meta">Assigned to</span>
          <select
            value={ticket.assignedToId ?? ""}
            disabled={pending}
            onChange={(event) => setTriage({ assignedToId: event.target.value || null })}
            className={SELECT_CLASS}
          >
            <option value="">Unassigned</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
                {member.role === "admin" ? " (admin)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
