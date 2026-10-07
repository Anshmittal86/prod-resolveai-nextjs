import type { CSSProperties, ReactNode } from "react";

// Small product illustrations for the feature grid. Each one animates through
// landing.css once its parent <Reveal> marks it `is-in`.

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function GroundedGraphic() {
  return (
    <div className="rounded-lg border border-line bg-paper p-4 text-[12px] leading-relaxed text-ink-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-mute">
        Payment policy
      </p>
      <ul className="mt-2 space-y-2">
        <li>Cards are authorised at order and charged at dispatch.</li>
        <li className="isolate">
          <span className="lp-cite">
            Duplicate charges are always handled by a human agent.
          </span>
        </li>
        <li className="text-mute">Pending holds clear in 3&ndash;5 business days.</li>
      </ul>
    </div>
  );
}

export function TicketGraphic() {
  const fields: [string, ReactNode][] = [
    ["Subject", "Duplicate charge on recent order"],
    ["Category", "Payment"],
    [
      "Priority",
      <span key="p" className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        High
      </span>,
    ],
    ["Reason", "Customer reports two charges"],
  ];
  return (
    <div className="rounded-lg border border-line bg-paper text-[12px]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] text-mute">create_ticket()</span>
        <span className="font-mono text-[11px]">#128</span>
      </div>
      <dl className="divide-y divide-line">
        {fields.map(([label, value], i) => (
          <div
            key={label}
            className="lp-field grid grid-cols-[76px_1fr] gap-2 px-4 py-2"
            style={delay(200 + i * 260)}
          >
            <dt className="text-mute">{label}</dt>
            <dd className="truncate font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const STATUSES = ["Open", "In progress", "Resolved", "Closed"];

export function LifecycleGraphic() {
  return (
    <div className="px-1 pt-3 pb-1">
      <div className="relative mx-[6px] h-px bg-line-strong">
        <div className="lp-track-fill absolute inset-0 bg-ink" />
        {STATUSES.map((status, i) => (
          <span
            key={status}
            className="lp-node absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${(i / 3) * 100}%`, ...delay(i * 1200) }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 text-[11px] text-ink-2">
        {STATUSES.map((status, i) => (
          <span
            key={status}
            className={i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center"}
          >
            {status}
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-1.5 border-t border-line pt-4 font-mono text-[10.5px] text-mute">
        {STATUS_LOG.map((entry, i) => (
          <li key={entry} className="lp-field flex items-center gap-2" style={delay(400 + i * 300)}>
            <span className="h-1 w-1 shrink-0 bg-line-strong" />
            {entry}
          </li>
        ))}
      </ul>
    </div>
  );
}

// System messages the ticket thread records as the status moves on.
const STATUS_LOG = [
  "Ticket marked as In progress by Dana",
  "Ticket marked as Resolved by Dana",
  "Ticket marked as Closed by Dana",
];

export function NotesGraphic() {
  return (
    <div className="space-y-2.5 text-[12px] leading-snug">
      <div className="rounded-lg border border-line bg-paper p-3">
        <p className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-mute">
          Reply <span>Customer sees this</span>
        </p>
        I&apos;ve refunded the second charge. It will show in 3&ndash;5 days.
      </div>
      <div className="rounded-lg border border-dashed border-amber bg-amber-soft p-3">
        <p className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-amber">
          Internal note <span>Staff only</span>
        </p>
        Gateway retried the capture. Flagged to payments.
      </div>
    </div>
  );
}

const EMAILS = [
  { to: "Customer", subject: "We've received your request [Ticket #128]" },
  { to: "Support team", subject: "[HIGH] New ticket #128: Duplicate charge" },
  { to: "Customer", subject: "New reply on your ticket #128" },
];

export function EmailGraphic() {
  return (
    <ul className="space-y-2 text-[12px]">
      {EMAILS.map((email, i) => (
        <li
          key={email.subject}
          className="lp-mail flex items-center gap-3 rounded-lg border border-line bg-paper px-3 py-2"
          style={delay(i * 700)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-hidden>
            <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="var(--color-ink)" strokeWidth="1.3" />
            <path d="m2 4 6 5 6-5" stroke="var(--color-ink)" strokeWidth="1.3" />
          </svg>
          <div className="min-w-0">
            <p className="truncate font-medium">{email.subject}</p>
            <p className="text-[11px] text-mute">To {email.to}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

const ROLES: { role: string; can: string[] }[] = [
  { role: "Customer", can: ["Chat with the assistant", "Track own tickets", "Reply in thread"] },
  { role: "Agent · Admin", can: ["Work the full queue", "Reply or add notes", "Set status, priority, owner"] },
];

export function RolesGraphic() {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11.5px]">
      {ROLES.map(({ role, can }, i) => (
        <div
          key={role}
          className="lp-field rounded-lg border border-line bg-paper p-3"
          style={delay(150 + i * 200)}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-mute">{role}</p>
          <ul className="mt-2 space-y-1.5">
            {can.map((item) => (
              <li key={item} className="flex gap-1.5 leading-tight">
                <svg width="10" height="10" viewBox="0 0 10 10" className="mt-[3px] shrink-0" aria-hidden>
                  <path d="m1.5 5.2 2.2 2.2L8.5 2.6" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
