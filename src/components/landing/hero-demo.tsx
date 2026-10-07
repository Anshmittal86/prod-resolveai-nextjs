"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// A scripted replay of the product's core loop: the assistant answers a
// routine question, escalates a payment problem to a ticket, and the ticket
// lands in the agent queue. Times are milliseconds from the start of a loop.
const T = {
  typing1: 900,
  answer1: 2300,
  followUp: 3700,
  typing2: 4500,
  answer2: 6000,
  ticket: 6700,
  queued: 7600,
  inProgress: 9400,
  resolved: 11400,
  loop: 14500,
} as const;

const SETTLED = T.resolved + 1;
const TICK = 100;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type Status = "open" | "in_progress" | "resolved";

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-soft text-blue" },
  in_progress: {
    label: "In progress",
    className: "bg-amber-soft text-amber",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-soft text-green",
  },
};

export function HeroDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [playhead, setPlayhead] = useState(0);
  const [cycle, setCycle] = useState(0);
  // With reduced motion the demo shows its final frame and never plays.
  const elapsed = reducedMotion ? SETTLED : playhead;

  useEffect(() => {
    if (reducedMotion) return;

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (ref.current) observer.observe(ref.current);

    // Paused while off screen or in a background tab.
    let ms = 0;
    const timer = window.setInterval(() => {
      if (!visible || document.hidden) return;
      ms += TICK;
      if (ms >= T.loop) {
        ms = 0;
        setCycle((c) => c + 1);
      }
      setPlayhead(ms);
    }, TICK);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [reducedMotion]);

  const at = (ms: number) => elapsed >= ms;
  const status: Status = at(T.resolved)
    ? "resolved"
    : at(T.inProgress)
      ? "in_progress"
      : "open";

  return (
    <div ref={ref} className="relative" aria-label="Product preview" role="img">
      {/* Chat window */}
      <div className="panel relative z-0 overflow-hidden" aria-hidden>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-on-ink">
              S
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-medium">ShopEase Support</p>
              <p className="flex items-center gap-1.5 text-[11px] text-mute">
                <span className="h-1.5 w-1.5 rounded-full bg-green" />
                Assistant available 24/7
              </p>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-mute">
            /chat
          </span>
        </div>

        <div key={cycle} className="flex h-[370px] flex-col justify-end gap-3 overflow-hidden px-4 py-4 sm:h-[400px]">
          <Bubble from="customer">
            Where&apos;s my order? It said 3&ndash;7 days and it&apos;s been four.
          </Bubble>

          {at(T.typing1) && !at(T.answer1) && <Typing />}
          {at(T.answer1) && (
            <Bubble from="ai">
              Standard delivery takes 3&ndash;7 business days after dispatch, so
              you&apos;re still in the window. The tracking link is in your
              shipping email.
            </Bubble>
          )}

          {at(T.followUp) && (
            <Bubble from="customer">I&apos;ve also been charged twice for it.</Bubble>
          )}

          {at(T.typing2) && !at(T.answer2) && <Typing />}
          {at(T.answer2) && (
            <Bubble from="ai">
              Duplicate charges need a person on our billing team. I&apos;ve
              opened a ticket with this conversation attached.
            </Bubble>
          )}

          {at(T.ticket) && (
            <div className="lp-msg ml-9 max-w-[85%] rounded-lg border border-line-strong bg-paper p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-mute">Ticket #128</span>
                <StatusPill status={status} />
              </div>
              <p className="mt-1 text-[13px] font-medium">Duplicate charge on recent order</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-2">
                <span>Payment</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  High
                </span>
                <span className="text-mute">Customer reports two charges</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-4 py-3">
          <div className="h-9 flex-1 rounded-md border border-line px-3 text-[13px] leading-9 text-mute">
            Type your message&hellip;
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-on-ink">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
        </div>
      </div>

      {/* Agent queue */}
      <div
        className="panel relative z-10 mt-4 overflow-hidden lg:absolute lg:-bottom-36 lg:-left-16 lg:mt-0 lg:w-[340px]"
        aria-hidden
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="text-[12px] font-medium">Agent queue</p>
          <span className="font-mono text-[10px] uppercase tracking-wider text-mute">
            /admin
          </span>
        </div>
        <ul key={cycle} className="divide-y divide-line text-[12px]">
          {at(T.queued) && (
            <QueueRow
              id={128}
              subject="Duplicate charge on recent order"
              meta={at(T.inProgress) ? "Payment · Assigned to you" : "Payment · Unassigned"}
              status={status}
              fresh
            />
          )}
          <QueueRow id={127} subject="Can't reset my password" meta="Account · Dana" status="in_progress" />
          <QueueRow id={126} subject="Parcel marked delivered, not received" meta="Delivery · Unassigned" status="open" />
          {!at(T.queued) && (
            <QueueRow id={125} subject="Refund for a returned jacket" meta="Refund · Omar" status="resolved" />
          )}
        </ul>
        <div className="h-0.5 bg-line">
          <div
            key={cycle}
            className="lp-progress h-full bg-ink"
            style={{ "--t": `${T.loop}ms` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}

function Bubble({ from, children }: { from: "customer" | "ai"; children: ReactNode }) {
  if (from === "customer") {
    return (
      <div className="lp-msg ml-auto max-w-[80%] rounded-lg rounded-br-sm bg-ink px-3 py-2 text-[13px] leading-snug text-on-ink">
        {children}
      </div>
    );
  }
  return (
    <div className="lp-msg flex max-w-[88%] items-end gap-2">
      <AssistantMark />
      <div className="rounded-lg rounded-bl-sm border border-line bg-paper px-3 py-2 text-[13px] leading-snug">
        {children}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="lp-msg flex items-end gap-2">
      <AssistantMark />
      <div className="lp-typing flex h-8 items-center gap-1 rounded-lg rounded-bl-sm border border-line bg-paper px-3">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function AssistantMark() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-card">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2" stroke="var(--color-ink)" strokeWidth="1.5" />
        <path d="M3.5 6.2 5.2 7.8 8.6 4.2" stroke="var(--color-accent)" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const { label, className } = STATUS_STYLE[status];
  return (
    <span key={status} className={`lp-flash shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${className}`}>
      {label}
    </span>
  );
}

function QueueRow({
  id,
  subject,
  meta,
  status,
  fresh = false,
}: {
  id: number;
  subject: string;
  meta: string;
  status: Status;
  fresh?: boolean;
}) {
  return (
    <li className={`flex items-center justify-between gap-3 px-4 py-2.5 ${fresh ? "lp-row-in" : ""}`}>
      <div className="min-w-0">
        <p className="truncate font-medium">
          <span className="mr-1.5 font-mono font-normal text-mute">#{id}</span>
          {subject}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-mute">{meta}</p>
      </div>
      <StatusPill status={status} />
    </li>
  );
}
