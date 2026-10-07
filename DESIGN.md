# ResolveAI Design System

The visual language of ResolveAI, shared by the landing page (`/`) and every
product screen (customer chat, tickets, staff dashboard, sign-in). Tokens are
defined once in [`src/app/globals.css`](src/app/globals.css) and exposed as
Tailwind utilities; nothing in `src/` should use Tailwind's default palette
(`gray-*`, `blue-*`, `black`, `white` ...) or hard-coded hex values.

## Principles

| Principle | In practice |
| --- | --- |
| **Calm, editorial, trustworthy** | Warm paper background, near-black ink, generous whitespace, hairline rules. It should read like a well-made tool, not a demo. |
| **Flat colour only** | No gradients, glows, blurred blobs, glassmorphism or neon. Depth comes from hairline borders and one soft panel shadow. |
| **One accent, used sparingly** | Vermilion (`accent`) marks the brand mark, eyebrow squares, focus rings and "high" priority. It is never a large fill, except the closing landing CTA. |
| **Show the product, not "AI"** | Illustrations are real UI: chat bubbles, ticket cards, queues, status tracks. No sparkles, robots, brains or circuit patterns. |
| **Motion explains** | Every animation demonstrates a product behaviour (a message arriving, a ticket being created, a status moving on). Nothing moves just to decorate. |
| **Honest content** | Copy and mock data match what the code does. No invented customer logos, testimonials or usage statistics. |

## Colour tokens

Use the utility (`bg-paper`, `text-ink`, `border-line`, `ring-blue/25` ...) in
markup and `var(--color-*)` in CSS or SVG attributes.

### Surfaces

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#f6f5f1` | Page background (set on `body`), header, chat and thread backgrounds. |
| `card` | `#ffffff` | Cards, panels, inputs, assistant message bubbles. |
| `sunken` | `#efede7` | Recessed or inactive areas: disabled inputs, inactive tabs, active nav pill, closed status, category chips. |

### Ink and rules

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#121211` | Primary text, primary buttons, customer chat bubbles, dark sections. |
| `ink-hover` | `#2c2b29` | Hover state of `ink` fills. |
| `ink-2` | `#3b3a37` | Body copy, labels, secondary emphasis. |
| `mute` | `#6b6963` | Meta text, captions, placeholders, low-priority dot. 5.0:1 on `paper`, 5.5:1 on `card`. |
| `line` | `#e3e1da` | Default hairline borders, dividers and card rings. |
| `line-strong` | `#cfccc3` | Input borders, ghost buttons, panel borders, hover rings. |

### On dark (`ink`) surfaces

| Token | Hex | Use |
| --- | --- | --- |
| `on-ink` | `#f6f5f1` | Text and icons on `ink`, `amber` or `green` fills. On `accent` it is 3.7:1, so use it there only for large headings; controls on `accent` use `btn-light` or `btn-primary`. |
| `on-ink-2` | `#c9c7c0` | Body copy on `ink`. |
| `on-ink-mute` | `#a3a19a` | Meta text on `ink`. |
| `ink-line` | `#3a3936` | Borders and rules on `ink`. |

### Accent

| Token | Hex | Use |
| --- | --- | --- |
| `accent` | `#e2482d` | Logo check, eyebrow squares, focus outline, "high" priority, the landing CTA band, motion highlights. |
| `accent-soft` | `#fbe4de` | Highlight sweeps and newly arrived rows in landing animations. |

### Semantic

| Token | Hex | Soft token | Soft hex | Meaning |
| --- | --- | --- | --- | --- |
| `blue` | `#2450d6` | `blue-soft` | `#e6ecfc` | Open tickets, "medium" priority, agent replies. |
| `amber` | `#a15c00` | `amber-soft` | `#fbf0dc` | In progress, internal notes (staff only). |
| `green` | `#18794e` | `green-soft` | `#e1f3e9` | Resolved, online indicator, ticket-created confirmation. |
| `danger` | `#b42318` | `danger-soft` | `#fdecea` | Errors, invalid fields, "critical" priority. |

Pair a strong token with its soft token: soft fill, strong text, and a ring of
the strong colour at 20–30% opacity (`bg-amber-soft text-amber ring-1 ring-amber/25`).

### Domain mappings

These mappings are fixed so a status or priority looks the same everywhere,
including the landing page mock-ups.

| Ticket status | Classes |
| --- | --- |
| Open | `bg-blue-soft text-blue ring-blue/25` |
| In progress | `bg-amber-soft text-amber ring-amber/25` |
| Resolved | `bg-green-soft text-green ring-green/25` |
| Closed | `bg-sunken text-mute ring-line` |

| Priority | Dot |
| --- | --- |
| Low | `bg-mute` |
| Medium | `bg-blue` |
| High | `bg-accent` |
| Critical | `bg-danger` |

| Message sender | Bubble |
| --- | --- |
| Customer (in their own chat) | `bg-ink text-on-ink` |
| Assistant | The surface opposite its background (`bg-card` on a `paper` thread, `bg-paper` inside a `card`), with a `line` ring or border |
| Agent reply | `bg-blue-soft ring-1 ring-blue/20` |
| Internal note | `bg-amber-soft ring-1 ring-amber/25`, labelled "Internal" |
| System (status change) | Centred `text-xs text-mute`, no bubble |

Source of truth in code: [`ticket-badges.tsx`](src/components/tickets/ticket-badges.tsx).

## Typography

Fonts are Geist (`font-sans`, the body default) and Geist Mono (`font-mono`),
loaded with `next/font` in [`layout.tsx`](src/app/layout.tsx).

| Class | Size / leading / tracking | Use |
| --- | --- | --- |
| `type-display` | `clamp(2.5rem, 4.6vw, 4rem)` / 0.96 / -0.045em, 600 | Landing hero headline only. |
| `type-heading` | `clamp(2rem, 4vw, 3.25rem)` / 1.02 / -0.035em, 600 | Landing section headings. |
| `type-title` | 1.625rem / 1.15 / -0.03em, 600 | Page titles in the app ("My tickets", "Support Dashboard", "Staff sign in"). |
| `text-xl font-semibold tracking-tight` | 1.25rem | Ticket subjects, card titles. |
| `text-[15px]`–`text-[17px]` | | Landing body copy (`leading-relaxed`, `text-ink-2`). |
| `text-sm` | 0.875rem | App body copy, buttons, form fields. |
| `type-meta` | 11px mono, uppercase, 0.06em | Table headers, sidebar section labels, "Staff portal". |
| `eyebrow` | 11px mono, uppercase, 0.09em, accent square | Labels above landing section headings. |

Rules:

- Headings use weight 600 with negative tracking. Do not use `font-bold`.
- Ticket numbers, routes and tool names (`#128`, `/chat`, `create_ticket`) are set in `font-mono`.
- Sentence case everywhere, including buttons.

## Shape, elevation and spacing

| Token | Value | Use |
| --- | --- | --- |
| `rounded-control` | 10px | Buttons, inputs, selects, alerts, nav pills. |
| `rounded-card` | 16px | Cards, panels, the chat window, the CTA band. |
| `rounded-full` | | Status pills, avatars, dots. |
| `rounded-md` / `rounded-lg` | 6px / 8px | Small chips and illustration elements inside cards. |
| `shadow-panel` | `0 1px 0 /4%`, `0 24px 48px -28px /28%` | Floating surfaces only: auth cards, the chat window, landing product mock-ups. |

- Cards are flat: `card` class, or `bg-card rounded-card ring-1 ring-line`. Hover raises the ring to `ring-line-strong`; it never adds a shadow.
- Page containers: `max-w-6xl` on the landing page, `max-w-5xl` (customer) and `max-w-6xl` (staff) in the app.
- Gutters: `px-4` on phones, `sm:px-6` above. Landing sections use `py-24 lg:py-32`.
- Background grids are SVG `<pattern>` hairlines in `line` (or `card` at 20% on the accent band), never CSS gradients.

## Components

Component classes live in `@layer components` in `globals.css`, so utilities
can always override them (`btn btn-primary h-8 px-3 text-sm`).

| Class | What it is |
| --- | --- |
| `btn` | Base button: 46px tall, 10px radius, 500 weight, press nudge, 50% opacity when disabled. Resize with `h-*`, `px-*`, `text-*`. |
| `btn-primary` | Ink fill, `on-ink` text. The one main action per view. |
| `btn-ghost` | `line-strong` outline, darkens to `ink` on hover. Secondary actions (sign out, "See how it works"). |
| `btn-light` | Paper fill for use on `ink` or `accent` backgrounds. |
| `btn-arrow` | Class for a trailing arrow icon; slides 3px right on button hover. |
| `field` | Text input, textarea and select. Turns `danger` when `aria-invalid="true"`. |
| `alert-danger` | Inline error banner for forms and the chat. |
| `card` | Flat white surface with a `line` border. |
| `panel` | Floating surface: `card` with a `line-strong` border and `shadow-panel`. |
| `eyebrow` | Mono section label with an accent square. |

Shared React components:

| Component | Path |
| --- | --- |
| `Logo` (mark and wordmark, `inverted` for dark backgrounds) | [`src/components/logo.tsx`](src/components/logo.tsx) |
| `StatusBadge`, `PriorityIndicator`, `CategoryPill` | [`src/components/tickets/ticket-badges.tsx`](src/components/tickets/ticket-badges.tsx) |
| `FormField`, `FormAlert`, `SubmitButton` | [`src/components/auth/form-controls.tsx`](src/components/auth/form-controls.tsx) |
| `Reveal` (scroll-triggered `is-in` class) | [`src/components/landing/reveal.tsx`](src/components/landing/reveal.tsx) |
| `Loader`, `PageLoader` | [`src/components/loader.tsx`](src/components/loader.tsx) |
| `SiteHeader` (customer), `StaffHeader` (staff portal) | [`src/components/site-header.tsx`](src/components/site-header.tsx), [`src/components/staff-header.tsx`](src/components/staff-header.tsx) |

## Motion

Landing motion lives in [`src/app/landing.css`](src/app/landing.css). The
product screens stay mostly still; they only use hover transitions and the
chat typing indicator.

| Token or pattern | Value | Use |
| --- | --- | --- |
| `ease-smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | Every transition and entrance. |
| Hover | 200–250ms | Button colour, arrow nudge, ring changes. |
| Entrance (`lp-fade-up`, `lp-reveal`) | 800–900ms, 14–18px rise, 80–120ms stagger | Hero copy on load; sections when scrolled into view. |
| Headline mask (`lp-line`) | 1s rise from a clipped line | Hero headline only. |
| Message in (`lp-msg`) | 550ms rise with slight scale | Chat bubbles in the hero demo. |
| Looping illustrations | 5–14s cycles | Hero demo, policy highlight, lifecycle track, email stack, workflow packets. They start only once visible (`.is-in`). |

Rules:

- Animate only `transform` and `opacity`. The exceptions are the `accent-soft` highlight flash and SVG `offset-distance`.
- Looping animations must pause or not start while off screen. `HeroDemo` also pauses in background tabs.
- Respect `prefers-reduced-motion`: animations are switched off and every graphic is shown in its finished state. Content never relies on motion to be understood.
- Content hidden for a reveal must still be visible without JavaScript (see the `<noscript>` rule on the landing page).
- No parallax, scroll-jacking, cursor followers, confetti or bouncing CTAs.

## Loading states

Every route segment has a `loading.tsx` that renders the shared loader, so
navigation always gets the same feedback.

| Pattern | Detail |
| --- | --- |
| The mark | The logo assembles itself in a 2s loop: the outline is traced in `ink` (0–35%), the square fills (30–45%), the check draws in `accent` (40–65%), it holds, then it fades out and scales to 94%. |
| Progress bar | A 120px `line` track with an `ink` segment sweeping across every 1.2s. |
| Label | `type-meta` text naming what is loading ("Loading queue", "Loading ticket", "Opening chat"). Defaults to "Loading". |
| Delay | Fades in after 150ms, so fast navigations never flash it. |
| Placement | `loading.tsx` sits inside the segment's layout, so headers stay in place and only the content area is replaced. Auth pages show it inside the card. |
| Accessibility | `role="status"` with `aria-live="polite"`. Reduced motion shows the finished logo and label, without the bar. |

Use `PageLoader` for a full content area and `Loader` inside an existing
surface. Do not use generic spinners, skeleton shimmer gradients or other
loaders.

## Staff portal

Staff screens use the same tokens and components as customer screens.

- The staff sign-in (`/admin/login`) mirrors the customer sign-in: `paper` background, a `panel` card, and the logo with a "Staff portal" tag.
- Signed-in screens share `StaffHeader`, a sticky `paper` header with the logo, a "Staff" tag, the user's initial, name and role, and a ghost sign-out button.
- Page heads use `eyebrow` + `type-title`. Metrics are a single hairline-divided strip with a semantic dot on each label. The queue is a `card` with a toolbar (`type-meta` filter labels, `field` selects, primary and ghost buttons) above a table with `type-meta` headers.
- On the ticket page, the escalation reason has an `accent` left rule, and the conversation sits on a `paper` thread inside a `card`. The reply box switches between "Public reply" (card) and "Internal note" (`amber-soft`) with a segmented control.

## Illustration

- Build illustrations from real interface parts drawn with the tokens above (bubbles, ticket cards, queue rows, status pills), in HTML or inline SVG.
- Icons are 1.3–1.6px line icons in `ink`; `accent` is used for one detail at most.
- Mock data uses the bundled ShopEase knowledge base, real email subjects and real system-message wording ("Ticket marked as Resolved by Dana"). Customer names are fictional and short ("Sam R.").

## Accessibility

- Text tokens meet WCAG AA (4.5:1) on their intended backgrounds: `ink`, `ink-2` and `mute` on `paper`, `card` or `sunken`; `on-ink*` on `ink`; each semantic colour on its own soft fill. The one exception is `on-ink` on `accent`, which is for large text only.
- Focus is a 2px `accent` outline with an offset, set globally for links, buttons, inputs and `summary`.
- Status is never shown by colour alone: badges carry a text label, and priority dots sit next to their label.
- Decorative graphics are `aria-hidden`. Animated product demos are `role="img"` with an `aria-label`.

## Adding or changing tokens

1. Add or edit the variable in the `@theme` block of `src/app/globals.css`. Tailwind generates the utility (`--color-foo` becomes `bg-foo`, `text-foo` ...).
2. Document it in the matching table above, with its intended use.
3. Prefer reusing an existing semantic token over adding a near-duplicate colour.
4. Check contrast for any new text colour against `paper` and `card`.
