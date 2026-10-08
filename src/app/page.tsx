import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  EmailGraphic,
  GroundedGraphic,
  LifecycleGraphic,
  NotesGraphic,
  RolesGraphic,
  TicketGraphic,
} from "@/components/landing/feature-graphics";
import { HeroDemo } from "@/components/landing/hero-demo";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/landing/reveal";
import { WorkflowDiagram } from "@/components/landing/workflow-diagram";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: "ResolveAI | AI customer support and ticketing" },
  description:
    "An assistant grounded in your support policies answers customers around the clock and hands anything that needs a person to your team as a ticket with the full conversation attached.",
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const NAV = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#teams", label: "For teams" },
  { href: "#faq", label: "FAQ" },
];

// Questions the bundled ShopEase knowledge base covers, shown in the marquee.
const TOPICS = [
  ["Delivery", "Where is my order?"],
  ["Account", "Reset my password"],
  ["Payment", "I was charged twice"],
  ["Order", "Change my delivery address"],
  ["Refund", "Start a return"],
  ["Delivery", "Do you ship internationally?"],
  ["Order", "Cancel before dispatch"],
  ["Payment", "Which cards do you accept?"],
  ["Delivery", "My parcel hasn't moved"],
  ["Order", "An item arrived damaged"],
] as const;

export default function LandingPage() {
  return (
    <div className="lp flex min-h-full flex-1 flex-col">
      <noscript>
        <style>{`.lp-reveal,.lp-field,.lp-mail{opacity:1!important;transform:none!important}`}</style>
      </noscript>
      <Header />
      <main className="flex-1">
        <Hero />
        <TopicMarquee />
        <HowItWorks />
        <Features />
        <Workflow />
        <ForTeams />
        <Stack />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}

function Arrow() {
  return (
    <svg className="btn-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="ResolveAI home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-ink-2 hover:text-ink">
            Sign in
          </Link>
          <Link href="/register" className="btn btn-primary h-9 px-3.5 text-sm">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:pt-24 lg:pb-52">
      <div className="flex flex-col justify-center">
        <p className="eyebrow lp-fade-up">Customer support · Ticketing</p>
        <h1 className="type-display mt-6">
          <span className="lp-line">
            <span style={delay(80)}>Answer the routine.</span>
          </span>
          <span className="lp-line">
            <span style={delay(200)} className="text-mute">
              Escalate the rest.
            </span>
          </span>
        </h1>
        <p className="lp-fade-up mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-2" style={delay(380)}>
          ResolveAI puts an assistant grounded in your support policies on the
          front line. When a customer needs a person, it opens a ticket with the
          whole conversation attached, so agents start with context instead of
          questions.
        </p>
        <div className="lp-fade-up mt-9 flex flex-wrap gap-3" style={delay(480)}>
          <Link href="/register" className="btn btn-primary">
            Start a support chat <Arrow />
          </Link>
          <a href="#how" className="btn btn-ghost">
            See how it works
          </a>
        </div>
        <dl className="lp-fade-up mt-12 grid max-w-md grid-cols-3 border-t border-line pt-5" style={delay(600)}>
          {[
            ["24/7", "Assistant cover"],
            ["4", "Ticket statuses"],
            ["7", "Issue categories"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="text-2xl font-semibold tracking-tight">{value}</dd>
              <dd className="mt-0.5 text-[13px] text-mute">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="lp-fade-up relative lg:pl-10" style={delay(300)}>
        <GridBackdrop />
        <div className="relative mx-auto max-w-[460px] lg:mr-0">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}

// Hairline grid behind the hero demo, drawn as an SVG pattern.
function GridBackdrop() {
  return (
    <svg className="pointer-events-none absolute -inset-x-4 -inset-y-8 hidden h-[calc(100%+4rem)] w-[calc(100%+2rem)] lg:block" aria-hidden>
      <defs>
        <pattern id="lp-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-grid)" />
    </svg>
  );
}

function TopicMarquee() {
  const items = [...TOPICS, ...TOPICS];
  return (
    <section aria-label="Questions the assistant handles" className="lp-marquee-wrap overflow-hidden border-y border-line bg-card py-4">
      <ul className="lp-marquee">
        {items.map(([category, question], i) => (
          <li key={i} aria-hidden={i >= TOPICS.length} className="flex shrink-0 items-center gap-3 px-7 text-sm">
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-mute">{category}</span>
            <span className="text-ink-2">{question}</span>
            <span className="ml-7 h-1 w-1 bg-line-strong" aria-hidden />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeading({
  label,
  title,
  intro,
}: {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <Reveal className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
      <div>
        <p className="eyebrow">{label}</p>
        <h2 className="type-heading mt-5 max-w-xl">{title}</h2>
      </div>
      {intro && <p className="max-w-md text-[16px] leading-relaxed text-ink-2 lg:justify-self-end">{intro}</p>}
    </Reveal>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Customers ask",
    body: "Any hour, in plain language. The assistant answers from the FAQs, hours and order and payment policies you configure.",
  },
  {
    n: "02",
    title: "The assistant decides",
    body: "Routine questions are answered on the spot. Duplicate charges, refunds, lost parcels or a request for a human become a ticket.",
  },
  {
    n: "03",
    title: "Your team resolves",
    body: "Agents pick tickets up from a filtered queue, reply in the thread, and move each one through to resolved and closed.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading
        label="How it works"
        title="One conversation, two possible endings."
        intro="Most questions never need a person. The ones that do arrive with everything an agent needs to act on them."
      />
      <ol className="mt-16 grid border-t border-line-strong md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal
            as="li"
            key={step.n}
            delay={i * 120}
            className="border-b border-line py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
          >
            <span className="font-mono text-[12px] text-accent">{step.n}</span>
            <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{step.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  graphic,
  className = "",
  index,
}: {
  title: string;
  body: string;
  graphic: ReactNode;
  className?: string;
  index: number;
}) {
  return (
    <Reveal delay={(index % 3) * 100} className={`card flex flex-col p-6 sm:p-7 ${className}`}>
      <div className="flex-1">{graphic}</div>
      <h3 className="mt-7 text-[17px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{body}</p>
    </Reveal>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-line bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
        <SectionHeading
          label="Features"
          title="Everything between the first message and the last reply."
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            index={0}
            title="Grounded in your policies"
            body="Answers come from the support hours, FAQs and rules you write. When the assistant can't see or change something, it escalates instead of guessing."
            graphic={<GroundedGraphic />}
          />
          <FeatureCard
            index={1}
            title="Escalation with context"
            body="Each ticket carries a subject, category, priority and the reason it was escalated, plus the chat that led to it."
            graphic={<TicketGraphic />}
          />
          <FeatureCard
            index={2}
            title="A clear lifecycle"
            body="Open, in progress, resolved, closed. Status changes are recorded in the thread so everyone sees what happened and when."
            graphic={<LifecycleGraphic />}
          />
          <FeatureCard
            index={3}
            title="Internal notes"
            body="Agents can talk to each other on a ticket without the customer ever seeing it. Public replies and notes are visually distinct."
            graphic={<NotesGraphic />}
          />
          <FeatureCard
            index={4}
            title="Email at the right moments"
            body="Customers get an acknowledgement when a ticket opens and a message when an agent replies. Your team is alerted to new tickets."
            graphic={<EmailGraphic />}
          />
          <FeatureCard
            index={5}
            title="Separate customer and staff access"
            body="Customers only ever see their own tickets. Staff sign in separately, and staff accounts are never created through public sign-up."
            graphic={<RolesGraphic />}
          />
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading
        label="Workflow"
        title="Follow a message through the system."
        intro="The assistant calls a single tool, create_ticket, when a conversation needs a person. Everything downstream is the queue your team already understands."
      />
      <div className="mt-14">
        <WorkflowDiagram />
      </div>
    </section>
  );
}

const QUEUE = [
  { id: 128, subject: "Duplicate charge on recent order", customer: "Sam R.", category: "Payment", priority: "High", status: "Open" },
  { id: 127, subject: "Can't reset my password", customer: "Lena K.", category: "Account", priority: "Medium", status: "In progress" },
  { id: 126, subject: "Parcel marked delivered, not received", customer: "Arjun M.", category: "Delivery", priority: "Critical", status: "Open" },
  { id: 125, subject: "Refund for a returned jacket", customer: "Chris B.", category: "Refund", priority: "Low", status: "Resolved" },
] as const;

const PRIORITY_DOT: Record<string, string> = {
  Low: "bg-mute",
  Medium: "bg-blue",
  High: "bg-accent",
  Critical: "bg-danger",
};

const STATUS_PILL: Record<string, string> = {
  Open: "bg-blue-soft text-blue",
  "In progress": "bg-amber-soft text-amber",
  Resolved: "bg-green-soft text-green",
};

function ForTeams() {
  const points = [
    ["Metrics at a glance", "Total, open, high or critical, and resolved, at the top of the queue."],
    ["Filters you can share", "Filter by status, priority and category. Filters live in the URL, so a view can be bookmarked."],
    ["Full control of a ticket", "Change status, priority, category and owner from the ticket page."],
  ];
  return (
    <section id="teams" className="scroll-mt-20 bg-ink text-on-ink">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-32">
        <Reveal>
          <p className="eyebrow text-on-ink-mute">For support teams</p>
          <h2 className="type-heading mt-5">A queue built for triage.</h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-on-ink-2">
            By the time a ticket reaches your team, the easy questions are gone.
            What&apos;s left is sorted, labelled and ready to work.
          </p>
          <dl className="mt-10 space-y-6">
            {points.map(([title, body]) => (
              <div key={title} className="border-l border-ink-line pl-5">
                <dt className="font-medium">{title}</dt>
                <dd className="mt-1 text-[14.5px] leading-relaxed text-on-ink-mute">{body}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={150} className="self-center">
          <div className="overflow-hidden rounded-card bg-paper text-ink" aria-hidden>
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="text-sm font-semibold">Support Dashboard</p>
              <div className="flex gap-1.5">
                {["Status", "Priority", "Category"].map((f) => (
                  <span key={f} className="rounded-md border border-line-strong bg-card px-2 py-1 text-[11px] text-ink-2">
                    {f}: All
                  </span>
                ))}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              {[
                ["Total", "128"],
                ["Open", "23"],
                ["High / Critical", "9"],
                ["Resolved", "94"],
              ].map(([label, value]) => (
                <div key={label} className="bg-card px-5 py-4">
                  <dt className="text-[11.5px] text-mute">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12.5px]">
                <thead className="border-y border-line font-mono text-[10px] uppercase tracking-wider text-mute">
                  <tr>
                    <th className="px-5 py-2.5 font-normal">Ticket</th>
                    <th className="px-3 py-2.5 font-normal">Customer</th>
                    <th className="px-3 py-2.5 font-normal">Category</th>
                    <th className="px-3 py-2.5 font-normal">Priority</th>
                    <th className="px-5 py-2.5 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-card">
                  {QUEUE.map((t, i) => (
                    <Reveal as="tr" key={t.id} delay={300 + i * 120}>
                      <td className="max-w-[220px] px-5 py-3">
                        <span className="block font-mono text-[10.5px] text-mute">#{t.id}</span>
                        <span className="block truncate font-medium">{t.subject}</span>
                      </td>
                      <td className="px-3 py-3 text-ink-2">{t.customer}</td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-paper px-1.5 py-0.5 text-[11px]">{t.category}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                    </Reveal>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STACK = [
  ["Application", "Next.js 16 and React 19", "Server-rendered pages and Server Actions"],
  ["Assistant", "OpenAI", "Function calling for create_ticket"],
  ["Data", "PostgreSQL on Neon", "Drizzle ORM and versioned migrations"],
  ["Accounts", "Better Auth", "Email and password, three roles"],
  ["Email", "Resend", "Transactional notifications"],
];

function Stack() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow">Under the hood</p>
          <h2 className="type-heading mt-5">Built on dependable parts.</h2>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-ink-2">
            No proprietary runtime. A standard web stack your engineers can
            read, run locally and extend.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <dl className="border-t border-line-strong">
            {STACK.map(([layer, tech, note]) => (
              <div key={layer} className="group grid grid-cols-[110px_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[140px_1fr_1fr]">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-mute sm:pt-0.5">{layer}</dt>
                <dd className="font-medium transition-transform duration-300 group-hover:translate-x-1">{tech}</dd>
                <dd className="col-start-2 text-sm text-mute sm:col-start-3">{note}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "What does the assistant know?",
    a: "Exactly what you give it: support hours, FAQs, and your order and payment policies. It is instructed to escalate rather than guess when a question falls outside them.",
  },
  {
    q: "When does a conversation become a ticket?",
    a: "When it needs a person: duplicate or unrecognised charges, refunds, lost or damaged orders, or whenever a customer asks for a human. The assistant then confirms the ticket number in the chat.",
  },
  {
    q: "Can customers see internal notes?",
    a: "No. Internal notes are only visible to agents and admins. Customers see public replies and status changes in their ticket thread.",
  },
  {
    q: "How do customers follow up?",
    a: "From My tickets, customers see every ticket they've opened with its current status and full thread, and can reply until the ticket is closed.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-32">
        <Reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="type-heading mt-5">Questions, answered.</h2>
        </Reveal>
        <Reveal delay={120} className="border-t border-line-strong">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="lp-faq group border-b border-line">
              <summary className="flex items-center justify-between gap-6 py-5 text-[17px] font-medium">
                {q}
                <svg className="lp-plus shrink-0" width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </summary>
              <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-ink-2">{a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-card bg-accent px-6 py-16 text-on-ink sm:px-14 sm:py-20">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" aria-hidden>
          <defs>
            <pattern id="lp-cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="var(--color-card)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-cta-grid)" />
        </svg>
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="type-heading max-w-2xl">Give your agents the conversations that need them.</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-light">
              Create an account <Arrow />
            </Link>
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-mute">
            AI-first customer support and ticketing.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 text-sm">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-mute">Product</p>
            <ul className="mt-4 space-y-2.5 text-ink-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-ink">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-wider text-mute">Account</p>
            <ul className="mt-4 space-y-2.5 text-ink-2">
              <li><Link href="/login" className="hover:text-ink">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-ink">Create account</Link></li>
              <li><Link href="/tickets" className="hover:text-ink">My tickets</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 font-mono text-[11px] text-mute sm:px-6">
          © 2026 ResolveAI
        </p>
      </div>
    </footer>
  );
}
