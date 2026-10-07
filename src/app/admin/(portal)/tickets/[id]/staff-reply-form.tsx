"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat";
import type { StaffMessageKind } from "@/lib/staff-tickets";
import { postStaffMessage } from "./actions";

const MODES: Record<
  StaffMessageKind,
  {
    tab: string;
    selectedTab: string;
    placeholder: string;
    submit: string;
    box: string;
    button: string;
  }
> = {
  reply: {
    tab: "Public reply",
    selectedTab: "bg-card text-ink ring-1 ring-line-strong",
    placeholder: "Reply to the customer. They'll also get an email...",
    submit: "Send reply",
    box: "border-line bg-card",
    button: "bg-ink hover:bg-ink-hover",
  },
  note: {
    tab: "Internal note",
    selectedTab: "bg-amber text-on-ink ring-1 ring-amber",
    placeholder: "Add a note for the support team. The customer won't see it...",
    submit: "Add note",
    box: "border-amber/30 bg-amber-soft",
    button: "bg-amber hover:bg-amber/90",
  },
};

export function StaffReplyForm({
  ticketId,
  acceptsReplies,
}: {
  ticketId: number;
  // Closed tickets take internal notes only.
  acceptsReplies: boolean;
}) {
  const [chosenKind, setKind] = useState<StaffMessageKind>("reply");
  // The ticket can be closed while this page is open; notes are all that's left.
  const kind = acceptsReplies ? chosenKind : "note";
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentOnce = useRef(false);
  const mode = MODES[kind];

  function send() {
    if (!content.trim() || pending) return;
    sentOnce.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const result = await postStaffMessage(ticketId, content, kind);
        // On failure the draft stays in the box so nothing is lost.
        if (result.ok) setContent("");
        else setError(result.error);
      } catch {
        setError("Couldn't post your message. Check your connection and try again.");
      }
    });
  }

  // The textarea is disabled while sending, which drops focus; hand it back
  // once the send settles (but don't grab focus on page load).
  useEffect(() => {
    if (!pending && sentOnce.current) inputRef.current?.focus();
  }, [pending]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    send();
  }

  // Enter sends; Shift+Enter starts a new line, as in the customer's reply box.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-card border p-4 transition-colors duration-200 ${mode.box}`}
    >
      <div
        role="group"
        aria-label="Message type"
        className="mb-3 inline-flex gap-1 rounded-control bg-sunken p-1"
      >
        {(Object.keys(MODES) as StaffMessageKind[]).map((option) => {
          const selected = option === kind;
          const disabled = pending || (option === "reply" && !acceptsReplies);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => setKind(option)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected ? MODES[option].selectedTab : "text-mute hover:text-ink"
              }`}
            >
              {MODES[option].tab}
            </button>
          );
        })}
      </div>
      {!acceptsReplies && (
        <p className="mb-3 text-xs text-mute">
          This ticket is closed, so it takes internal notes only.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="alert-danger mb-3"
        >
          {error}
        </p>
      )}
      <div className="flex items-end gap-3">
        <label htmlFor="staff-reply-input" className="sr-only">
          {mode.tab}
        </label>
        <textarea
          ref={inputRef}
          id="staff-reply-input"
          rows={2}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={mode.placeholder}
          disabled={pending}
          className="field field-sizing-content max-h-60 flex-1 resize-none"
        />
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className={`btn h-auto px-5 py-3 text-sm text-on-ink ${mode.button}`}
        >
          {pending ? "Posting..." : mode.submit}
        </button>
      </div>
    </form>
  );
}
