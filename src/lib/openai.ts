import "server-only";
import OpenAI from "openai";
import type {
  FunctionTool,
  Response,
  ResponseCreateParamsNonStreaming,
  ResponseInputItem,
} from "openai/resources/responses/responses";
import type { ChatTurn } from "./chat";

// OPENAI_MODEL can swap in another model (e.g. a cheaper mini tier) without
// a code change.
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6-astra";

let client: OpenAI | undefined;

/**
 * Returns the shared OpenAI client, created on first use so importing this
 * module never requires the key.
 *
 * @throws Error when `OPENAI_API_KEY` is not set.
 */
export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    // The SDK already retries 408, 429 and 5xx with backoff; the timeout keeps
    // a stalled request from holding the customer's chat turn open.
    client = new OpenAI({ apiKey, maxRetries: 3, timeout: 30_000 });
  }
  return client;
}

/** The slice of the SDK client the runner uses, so tests can supply a fake. */
export interface ResponsesClient {
  responses: {
    create(params: ResponseCreateParamsNonStreaming): Promise<Response>;
  };
}

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export type ToolResult = Record<string, unknown>;

export interface RunConversationOptions {
  ai: ResponsesClient;
  history: ChatTurn[];
  instructions: string;
  tools: FunctionTool[];
  /**
   * Executes a tool the model asked for; its result is sent back to the
   * model. A thrown error's message is sent back too, so keep it
   * customer-safe.
   */
  onToolCall: (call: ToolCall) => Promise<ToolResult>;
  /** Bounds tool-call round trips so a looping model cannot run up requests. */
  maxToolRounds?: number;
}

export interface ConversationResult {
  text: string;
  toolCalls: (ToolCall & { result: ToolResult })[];
}

/**
 * Runs one chat turn against the Responses API, executing any function calls
 * the model makes until it answers in text.
 *
 * @throws Error when the API fails or the model is still calling tools after
 *   `maxToolRounds` rounds.
 */
export async function runConversation({
  ai,
  history,
  instructions,
  tools,
  onToolCall,
  maxToolRounds = 3,
}: RunConversationOptions): Promise<ConversationResult> {
  const input: ResponseInputItem[] = history.map(toInputMessage);
  const toolCalls: ConversationResult["toolCalls"] = [];

  for (let round = 0; ; round++) {
    const response = await ai.responses.create({
      model: OPENAI_MODEL,
      instructions,
      input,
      tools,
      // Each request resends the whole conversation, so nothing needs to be
      // kept on OpenAI's side. Without storage, reasoning items only survive
      // the tool round trip as encrypted content.
      store: false,
      include: ["reasoning.encrypted_content"],
    });

    const calls = response.output.filter(
      (item) => item.type === "function_call",
    );
    if (calls.length === 0) {
      return { text: response.output_text, toolCalls };
    }
    if (round === maxToolRounds) {
      throw new Error(
        `OpenAI was still calling tools after ${maxToolRounds} rounds`,
      );
    }

    // Echo the model's output (reasoning included) before the tool results:
    // each function_call_output must follow the call it answers.
    input.push(...(response.output as ResponseInputItem[]));

    for (const call of calls) {
      const toolCall = { name: call.name, args: parseArguments(call.arguments) };
      let result: ToolResult;
      try {
        result = await onToolCall(toolCall);
      } catch (error) {
        // A failed tool goes back to the model as an error so it can tell the
        // customer, rather than crashing the whole chat turn.
        result = {
          error: error instanceof Error ? error.message : "Tool failed",
        };
      }
      toolCalls.push({ ...toolCall, result });
      input.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }
}

function toInputMessage(turn: ChatTurn): ResponseInputItem {
  return {
    role: turn.role === "model" ? "assistant" : "user",
    content: turn.text,
  };
}

// Malformed JSON becomes empty arguments, so the tool's own validation reports
// the missing fields back to the model instead of the turn crashing.
function parseArguments(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
