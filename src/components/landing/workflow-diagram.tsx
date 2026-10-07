import type { CSSProperties } from "react";
import { Reveal } from "./reveal";

// How a conversation moves through ResolveAI. Wide screens get the branching
// diagram; narrow screens get the same steps as a vertical list.

const NODE_W = 184;
const NODE_H = 68;

const NODES = [
  { x: 16, y: 116, title: "Customer", sub: "Asks in /chat, any hour" },
  { x: 268, y: 116, title: "Assistant", sub: "Reads your policies" },
  { x: 540, y: 20, title: "Answered", sub: "Resolved in the chat" },
  { x: 540, y: 212, title: "Ticket", sub: "When a person is needed" },
  { x: 800, y: 212, title: "Agent", sub: "Replies, notes, resolves" },
] as const;

const WIRES = [
  { d: "M200 150 H268", t: 1800, delay: 0 },
  { d: "M452 150 C496 150 496 54 540 54", t: 2400, delay: 900 },
  { d: "M452 150 C496 150 496 246 540 246", t: 2400, delay: 1500 },
  { d: "M724 246 H800", t: 1800, delay: 2600 },
] as const;

export function WorkflowDiagram() {
  return (
    <Reveal fade={false} className="card overflow-hidden">
      <div className="hidden p-8 md:block">
        <svg viewBox="0 0 1000 300" className="w-full" role="img" aria-labelledby="wf-title">
          <title id="wf-title">
            A customer message goes to the assistant, which either answers it or
            opens a ticket for an agent.
          </title>
          {WIRES.map((wire) => (
            <g key={wire.d}>
              <path d={wire.d} fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" className="lp-wire" />
              <circle
                r="4"
                fill="var(--color-accent)"
                className="lp-packet"
                style={
                  {
                    offsetPath: `path("${wire.d}")`,
                    "--t": `${wire.t}ms`,
                    "--d": `${wire.delay}ms`,
                  } as CSSProperties
                }
              />
            </g>
          ))}

          <text x="506" y="108" className="fill-mute font-mono text-[11px]">
            answer
          </text>
          <text x="506" y="200" className="fill-mute font-mono text-[11px]">
            create_ticket
          </text>
          <text x="762" y="236" textAnchor="middle" className="fill-mute font-mono text-[11px]">
            queue
          </text>

          {NODES.map((node, i) => (
            <g key={node.title} transform={`translate(${node.x} ${node.y})`}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx="10"
                fill={i === 1 ? "var(--color-ink)" : "var(--color-card)"}
                stroke={i === 1 ? "var(--color-ink)" : "var(--color-line-strong)"}
              />
              <text x="18" y="29" className={`text-[15px] font-semibold ${i === 1 ? "fill-paper" : "fill-ink"}`}>
                {node.title}
              </text>
              <text x="18" y="49" className={`text-[12px] ${i === 1 ? "fill-on-ink-mute" : "fill-mute"}`}>
                {node.sub}
              </text>
            </g>
          ))}

          {/* Email side-channel from the ticket and agent */}
          <path d="M892 212 V120" fill="none" stroke="var(--color-line-strong)" strokeWidth="1.5" className="lp-wire" />
          <g transform="translate(818 64)">
            <rect width="148" height="56" rx="10" fill="var(--color-paper)" stroke="var(--color-line-strong)" strokeDasharray="4 4" />
            <text x="16" y="25" className="fill-ink text-[13px] font-semibold">
              Email
            </text>
            <text x="16" y="42" className="fill-mute text-[11.5px]">
              Customer kept in loop
            </text>
          </g>
        </svg>
      </div>

      <ol className="divide-y divide-line md:hidden">
        {NODES.map((node, i) => (
          <li key={node.title} className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 font-mono text-[11px] text-mute">0{i + 1}</span>
            <div>
              <p className="font-semibold">{node.title}</p>
              <p className="text-sm text-mute">{node.sub}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
