import type {
  Response,
  ResponseCreateParamsNonStreaming,
  ResponseFunctionToolCall,
  ResponseOutputItem,
} from "openai/resources/responses/responses";
import { describe, expect, it, vi } from "vitest";
import { CREATE_TICKET_TOOL } from "./create-ticket-tool";
import { runConversation } from "./openai";

vi.mock("server-only", () => ({}));

function textReply(text: string): Response {
  return modelReply([
    {
      type: "message",
      id: "msg-1",
      role: "assistant",
      status: "completed",
      content: [{ type: "output_text", text, annotations: [] }],
    },
  ]);
}

function modelReply(output: ResponseOutputItem[]): Response {
  const text = output
    .flatMap((item) => (item.type === "message" ? item.content : []))
    .map((part) => (part.type === "output_text" ? part.text : ""))
    .join("");
  return { output, output_text: text } as Response;
}

function functionCall(
  args: Record<string, unknown> | string,
  callId = "call-1",
): ResponseFunctionToolCall {
  return {
    type: "function_call",
    call_id: callId,
    name: "create_ticket",
    arguments: typeof args === "string" ? args : JSON.stringify(args),
  };
}

// Stands in for the Responses API: replays canned replies and records requests.
function fakeOpenAI(...replies: Response[]) {
  const requests: ResponseCreateParamsNonStreaming[] = [];
  const create = vi.fn(async (params: ResponseCreateParamsNonStreaming) => {
    // Snapshot input: the runner keeps appending to the same array.
    requests.push({ ...params, input: structuredClone(params.input) });
    const reply = replies.shift();
    if (!reply) throw new Error("Unexpected extra OpenAI request");
    return reply;
  });
  return { ai: { responses: { create } }, requests };
}

describe("runConversation", () => {
  it("returns the model's answer and sends history, instructions and tools", async () => {
    const { ai, requests } = fakeOpenAI(
      textReply("Returns are accepted within 30 days."),
    );

    const result = await runConversation({
      ai,
      instructions: "You are a support assistant.",
      tools: [CREATE_TICKET_TOOL],
      history: [
        { role: "user", text: "Hi" },
        { role: "model", text: "Hello! How can I help?" },
        { role: "user", text: "What is your return policy?" },
      ],
      onToolCall: vi.fn(),
    });

    expect(result).toEqual({
      text: "Returns are accepted within 30 days.",
      toolCalls: [],
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].input).toEqual([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello! How can I help?" },
      { role: "user", content: "What is your return policy?" },
    ]);
    expect(requests[0].instructions).toBe("You are a support assistant.");
    expect(requests[0].tools).toEqual([CREATE_TICKET_TOOL]);
  });

  it("runs a requested tool, returns its result to the model, and relays the follow-up answer", async () => {
    const ticketArgs = {
      subject: "Payment deducted but order not confirmed",
      category: "payment",
      priority: "high",
      escalationReason: "Customer was charged without an order confirmation.",
    };
    const reasoning: ResponseOutputItem = {
      type: "reasoning",
      id: "rs-1",
      summary: [],
      encrypted_content: "opaque",
    };
    const call = functionCall(ticketArgs);
    const { ai, requests } = fakeOpenAI(
      modelReply([reasoning, call]),
      textReply("I've opened ticket #42 for you."),
    );
    const onToolCall = vi.fn(async () => ({ ticketId: 42, status: "created" }));

    const result = await runConversation({
      ai,
      instructions: "You are a support assistant.",
      tools: [CREATE_TICKET_TOOL],
      history: [{ role: "user", text: "I was charged but have no order!" }],
      onToolCall,
    });

    expect(onToolCall).toHaveBeenCalledExactlyOnceWith({
      name: "create_ticket",
      args: ticketArgs,
    });
    expect(result).toEqual({
      text: "I've opened ticket #42 for you.",
      toolCalls: [
        {
          name: "create_ticket",
          args: ticketArgs,
          result: { ticketId: 42, status: "created" },
        },
      ],
    });
    // The model's output is echoed back unchanged (reasoning included),
    // followed by the tool's result.
    expect(requests[1].input).toEqual([
      { role: "user", content: "I was charged but have no order!" },
      reasoning,
      call,
      {
        type: "function_call_output",
        call_id: "call-1",
        output: JSON.stringify({ ticketId: 42, status: "created" }),
      },
    ]);
  });

  it("reports a failed tool to the model so it can explain instead of crashing the turn", async () => {
    const { ai, requests } = fakeOpenAI(
      modelReply([functionCall({ category: "billing" })]),
      textReply("Sorry, I couldn't open a ticket just now."),
    );

    const result = await runConversation({
      ai,
      instructions: "You are a support assistant.",
      tools: [CREATE_TICKET_TOOL],
      history: [{ role: "user", text: "I need a human" }],
      onToolCall: async () => {
        throw new Error('create_ticket: "subject" is required');
      },
    });

    expect(result.text).toBe("Sorry, I couldn't open a ticket just now.");
    expect(result.toolCalls).toEqual([
      {
        name: "create_ticket",
        args: { category: "billing" },
        result: { error: 'create_ticket: "subject" is required' },
      },
    ]);
    expect(requests[1].input).toContainEqual({
      type: "function_call_output",
      call_id: "call-1",
      output: JSON.stringify({ error: 'create_ticket: "subject" is required' }),
    });
  });

  it("hands malformed JSON arguments to the tool as empty arguments", async () => {
    const { ai } = fakeOpenAI(
      modelReply([functionCall("{not json")]),
      textReply("Could you tell me more?"),
    );
    const onToolCall = vi.fn(async () => ({}));

    await runConversation({
      ai,
      instructions: "You are a support assistant.",
      tools: [CREATE_TICKET_TOOL],
      history: [{ role: "user", text: "Help" }],
      onToolCall,
    });

    expect(onToolCall).toHaveBeenCalledWith({ name: "create_ticket", args: {} });
  });

  it("gives up when the model keeps calling tools without answering", async () => {
    const call = (): Response => modelReply([functionCall({})]);
    const { ai, requests } = fakeOpenAI(call(), call(), call(), call());

    await expect(
      runConversation({
        ai,
        instructions: "You are a support assistant.",
        tools: [CREATE_TICKET_TOOL],
        history: [{ role: "user", text: "Help" }],
        onToolCall: async () => ({ status: "created" }),
        maxToolRounds: 3,
      }),
    ).rejects.toThrow(/tool/i);
    expect(requests).toHaveLength(4);
  });
});
