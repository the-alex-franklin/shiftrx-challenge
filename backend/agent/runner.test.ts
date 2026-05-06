import { assertEquals } from "jsr:@std/assert";
import { toOpenAIMessages, type MessageRow } from "./messages.ts";

const BASE_DATE = new Date("2026-01-01T00:00:00Z");
let seq = 0;

function row(overrides: Partial<MessageRow> & { role: string }): MessageRow {
  return {
    id: `id-${++seq}`,
    content: null,
    toolCallId: null,
    toolName: null,
    createdAt: BASE_DATE,
    ...overrides,
  };
}

Deno.test("empty input returns empty array", () => {
  assertEquals(toOpenAIMessages([]), []);
});

Deno.test("plain user message", () => {
  const result = toOpenAIMessages([row({ role: "user", content: "hello" })]);
  assertEquals(result, [{ role: "user", content: "hello" }]);
});

Deno.test("plain assistant message with no toolCallId", () => {
  const result = toOpenAIMessages([
    row({ role: "assistant", content: "I can help with that." }),
  ]);
  assertEquals(result, [{ role: "assistant", content: "I can help with that." }]);
});

Deno.test("single assistant tool-call row becomes assistant message with tool_calls", () => {
  const result = toOpenAIMessages([
    row({
      role: "assistant",
      toolCallId: "call-1",
      toolName: "get_shifts",
      content: '{"start":"2026-01-01","end":"2026-01-02"}',
    }),
  ]);
  assertEquals(result, [
    {
      role: "assistant",
      content: null,
      tool_calls: [
        {
          id: "call-1",
          type: "function",
          function: {
            name: "get_shifts",
            arguments: '{"start":"2026-01-01","end":"2026-01-02"}',
          },
        },
      ],
    },
  ]);
});

Deno.test("two consecutive assistant tool-call rows merge into one message", () => {
  const result = toOpenAIMessages([
    row({
      role: "assistant",
      toolCallId: "call-1",
      toolName: "get_shifts",
      content: '{"start":"2026-01-01","end":"2026-01-02"}',
    }),
    row({
      role: "assistant",
      toolCallId: "call-2",
      toolName: "get_coverage_candidates",
      content: '{"shift_id":"shift-abc"}',
    }),
  ]);
  assertEquals(result.length, 1);
  const msg = result[0] as { role: string; tool_calls: unknown[] };
  assertEquals(msg.role, "assistant");
  assertEquals(msg.tool_calls.length, 2);
});

Deno.test("tool result row becomes tool message", () => {
  const result = toOpenAIMessages([
    row({
      role: "tool",
      toolCallId: "call-1",
      toolName: "get_shifts",
      content: "[]",
    }),
  ]);
  assertEquals(result, [
    { role: "tool", tool_call_id: "call-1", content: "[]" },
  ]);
});

Deno.test("null content in tool result becomes empty string", () => {
  const result = toOpenAIMessages([
    row({ role: "tool", toolCallId: "call-1", toolName: "get_shifts", content: null }),
  ]);
  assertEquals(result, [
    { role: "tool", tool_call_id: "call-1", content: "" },
  ]);
});

Deno.test("plain assistant after tool results is NOT merged with prior tool-call rows", () => {
  const result = toOpenAIMessages([
    row({
      role: "assistant",
      toolCallId: "call-1",
      toolName: "get_shifts",
      content: "{}",
    }),
    row({ role: "tool", toolCallId: "call-1", toolName: "get_shifts", content: "[]" }),
    row({ role: "assistant", content: "No shifts found." }),
  ]);
  assertEquals(result.length, 3);
  assertEquals(result[2], { role: "assistant", content: "No shifts found." });
});

Deno.test("full multi-turn conversation with two parallel tool calls", () => {
  const rows: MessageRow[] = [
    row({ role: "user", content: "Who is working today?" }),
    // assistant makes two tool calls in one turn
    row({ role: "assistant", toolCallId: "tc-1", toolName: "get_shifts", content: '{"start":"2026-01-01T00:00:00Z","end":"2026-01-01T23:59:59Z"}' }),
    row({ role: "assistant", toolCallId: "tc-2", toolName: "get_coverage_candidates", content: '{"shift_id":"s-1"}' }),
    // two tool results
    row({ role: "tool", toolCallId: "tc-1", toolName: "get_shifts", content: '[{"id":"s-1"}]' }),
    row({ role: "tool", toolCallId: "tc-2", toolName: "get_coverage_candidates", content: '[{"id":"p-2"}]' }),
    // final assistant reply
    row({ role: "assistant", content: "Dr. Smith is working today." }),
  ];

  const result = toOpenAIMessages(rows);

  assertEquals(result.length, 5);
  assertEquals(result[0], { role: "user", content: "Who is working today?" });

  // merged tool-calls message
  const assistantMsg = result[1] as {
    role: string;
    content: null;
    tool_calls: Array<{ id: string }>;
  };
  assertEquals(assistantMsg.role, "assistant");
  assertEquals(assistantMsg.content, null);
  assertEquals(assistantMsg.tool_calls.length, 2);
  assertEquals(assistantMsg.tool_calls[0].id, "tc-1");
  assertEquals(assistantMsg.tool_calls[1].id, "tc-2");

  assertEquals(result[2], { role: "tool", tool_call_id: "tc-1", content: '[{"id":"s-1"}]' });
  assertEquals(result[3], { role: "tool", tool_call_id: "tc-2", content: '[{"id":"p-2"}]' });
  assertEquals(result[4], { role: "assistant", content: "Dr. Smith is working today." });
});
