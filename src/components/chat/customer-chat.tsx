"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Fragment,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { type ChatResponse, MAX_MESSAGE_LENGTH } from "@/lib/chat";
import type { ChatTurn } from "@/lib/chat";

// ticketId marks the reply on which the AI escalated to a ticket.
type ChatMessage = ChatTurn & { id: number; ticketId?: number };

const FALLBACK_ERROR = "Something went wrong. Please try again.";

let nextId = 0;

export function CustomerChat({ customerName }: { customerName: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;

    const userMessage: ChatMessage = { id: nextId++, role: "user", text };
    // The greeting is UI-only, so the transcript starts with the customer.
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, text }) => ({ role, text })),
        }),
      });

      if (response.status === 401) {
        // Session expired mid-chat.
        router.replace("/login");
        router.refresh();
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | (Partial<ChatResponse> & { error?: string })
        | null;

      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || FALLBACK_ERROR);
      }

      const { reply, ticket } = data;
      setMessages((current) => [
        ...current,
        { id: nextId++, role: "model", text: reply, ticketId: ticket?.id },
      ]);
    } catch (caught) {
      // Take the unanswered message back out of the transcript and return it
      // to the input, so a resend doesn't leave two customer turns in a row.
      setMessages((current) => current.filter((m) => m.id !== userMessage.id));
      setInput(text);
      setError(
        caught instanceof TypeError
          ? "Couldn't reach support. Check your connection and try again."
          : caught instanceof Error
            ? caught.message
            : FALLBACK_ERROR,
      );
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send();
  }

  // Enter sends; Shift+Enter starts a new line.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  function startNewChat() {
    setMessages([]);
    setInput("");
    setError(null);
  }

  const escalated = messages.some((message) => message.ticketId !== undefined);
  const firstName = customerName.trim().split(/\s+/)[0];

  return (
    <div className="flex h-[min(700px,calc(100dvh-8rem))] w-full panel max-w-3xl flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">ResolveAI</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-mute">
            <span className="h-2 w-2 rounded-full bg-green" />
            Online
          </div>
        </div>
        <div className="rounded-full bg-sunken px-3 py-1 text-sm text-mute">
          Support Assistant
        </div>
      </header>

      <section
        aria-label="Conversation"
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto bg-paper p-6"
      >
        <Bubble role="model">
          {`Hi${firstName ? ` ${firstName}` : ""}! 👋 I'm your AI support assistant. Ask me about orders, payments, deliveries, returns or your account.`}
        </Bubble>

        {messages.map((message) => (
          <Fragment key={message.id}>
            <Bubble role={message.role}>{message.text}</Bubble>
            {message.ticketId !== undefined && (
              <TicketCreatedBanner ticketId={message.ticketId} />
            )}
          </Fragment>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div
              role="status"
              className="flex items-center gap-1 rounded-card rounded-bl-md bg-card px-4 py-3 ring-1 ring-line"
            >
              <span className="sr-only">Assistant is typing</span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-mute [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-mute [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-mute" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </section>

      {escalated ? (
        // One ticket per conversation: once escalated, the chat ends so later
        // messages can't open a duplicate or go unseen by the agent.
        <div className="flex flex-col items-center gap-3 border-t border-line bg-card p-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-mute">
            This conversation has been handed to our support team.
          </p>
          <button
            type="button"
            onClick={startNewChat}
            className="btn btn-ghost h-10 shrink-0 px-4 text-sm"
          >
            Start a new chat
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t border-line bg-card p-4">
          {error && (
            <p
              role="alert"
              className="mb-3 alert-danger"
            >
              {error}
            </p>
          )}
          <div className="flex items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder="Ask a question or describe your problem..."
              disabled={pending}
              autoFocus
              className="max-h-40 flex-1 resize-none field field-sizing-content"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="btn btn-primary h-auto px-5 py-3 text-sm"
            >
              {pending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: ChatMessage["role"];
  children: string;
}) {
  const fromCustomer = role === "user";

  return (
    <div className={`flex ${fromCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] whitespace-pre-wrap wrap-break-word rounded-card px-4 py-3 text-sm ${
          fromCustomer
            ? "rounded-br-md bg-ink text-on-ink"
            : "rounded-bl-md bg-card text-ink-2 ring-1 ring-line"
        }`}
      >
        <span className="sr-only">{fromCustomer ? "You: " : "Assistant: "}</span>
        {children}
      </div>
    </div>
  );
}

function TicketCreatedBanner({ ticketId }: { ticketId: number }) {
  return (
    <div
      role="status"
      className="mx-auto flex max-w-md items-center justify-between gap-4 rounded-card border border-green/25 bg-green-soft px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green text-sm text-on-ink"
        >
          ✓
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">
            Ticket Created #{ticketId}
          </p>
          <p className="text-xs text-green">
            A support agent will follow up with you.
          </p>
        </div>
      </div>
      <Link
        href={`/tickets/${ticketId}`}
        className="btn h-8 shrink-0 bg-green px-3 text-sm text-on-ink hover:bg-green/90"
      >
        View ticket
      </Link>
    </div>
  );
}
