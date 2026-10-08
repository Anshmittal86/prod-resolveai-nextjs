import { describe, expect, it } from "vitest";
import { parseCreateTicketArgs } from "./create-ticket-tool";

describe("parseCreateTicketArgs", () => {
  const valid = {
    subject: "  Refund not received  ",
    category: "refund",
    priority: "medium",
    escalationReason: "Refund approved 10 days ago but not credited.",
  };

  it("accepts well-formed arguments and trims the text fields", () => {
    expect(parseCreateTicketArgs(valid)).toEqual({
      subject: "Refund not received",
      category: "refund",
      priority: "medium",
      escalationReason: "Refund approved 10 days ago but not credited.",
    });
  });

  it("rejects a category or priority outside the allowed values", () => {
    expect(() =>
      parseCreateTicketArgs({ ...valid, category: "billing" }),
    ).toThrow(/category/);
    expect(() =>
      parseCreateTicketArgs({ ...valid, priority: "urgent" }),
    ).toThrow(/priority/);
  });

  it("rejects missing or blank text fields", () => {
    expect(() => parseCreateTicketArgs({ ...valid, subject: "   " })).toThrow(
      /subject/,
    );
    expect(() =>
      parseCreateTicketArgs({ ...valid, escalationReason: undefined }),
    ).toThrow(/escalationReason/);
  });

  it("cuts an over-long subject to the 255 characters the tickets table holds", () => {
    const parsed = parseCreateTicketArgs({
      ...valid,
      subject: "x".repeat(300),
    });
    expect(parsed.subject).toHaveLength(255);
  });
});
