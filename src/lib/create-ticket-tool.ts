import type { FunctionTool } from "openai/resources/responses/responses";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketCategory,
  type TicketPriority,
} from "@/db/schema";

/** Tool the assistant calls to hand a conversation over to a human agent. */
export const CREATE_TICKET_TOOL: FunctionTool = {
  type: "function",
  name: "create_ticket",
  description:
    "Create a formal support ticket when an issue requires human assistance, payment resolution, refund approval, or user requests agent.",
  parameters: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description: "Short summary of the customer's issue.",
      },
      category: { type: "string", enum: [...TICKET_CATEGORIES] },
      priority: { type: "string", enum: [...TICKET_PRIORITIES] },
      escalationReason: {
        type: "string",
        description: "Why this conversation needs a human agent.",
      },
    },
    required: ["subject", "category", "priority", "escalationReason"],
    additionalProperties: false,
  },
  strict: true,
};

export interface CreateTicketArgs {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  escalationReason: string;
}

// Matches the varchar(255) subject column on the tickets table.
const SUBJECT_MAX_LENGTH = 255;

/**
 * Validates the model's `create_ticket` arguments, which stay untrusted even
 * under strict mode: a blank subject still satisfies `"string"`.
 *
 * @param args The parsed JSON arguments from the model's function call.
 * @returns The trimmed ticket details, with the subject cut to fit the column.
 * @throws Error naming the offending field; its message is relayed to the
 *   model, so it must stay customer-safe.
 */
export function parseCreateTicketArgs(
  args: Record<string, unknown>,
): CreateTicketArgs {
  return {
    subject: requireText(args, "subject").slice(0, SUBJECT_MAX_LENGTH),
    category: requireOneOf(args, "category", TICKET_CATEGORIES),
    priority: requireOneOf(args, "priority", TICKET_PRIORITIES),
    escalationReason: requireText(args, "escalationReason"),
  };
}

function requireText(args: Record<string, unknown>, field: string): string {
  const value = args[field];
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`create_ticket: "${field}" is required`);
  return text;
}

function requireOneOf<T extends string>(
  args: Record<string, unknown>,
  field: string,
  allowed: readonly T[],
): T {
  const value = args[field];
  if (!(allowed as readonly unknown[]).includes(value)) {
    throw new Error(
      `create_ticket: "${field}" must be one of ${allowed.join(", ")}`,
    );
  }
  return value as T;
}
