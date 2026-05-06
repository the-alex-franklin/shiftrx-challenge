import OpenAI from "openai";

export type MessageRow = {
  id: string;
  role: string;
  content: string | null;
  toolCallId: string | null;
  toolName: string | null;
  createdAt: Date | null;
};

export function toOpenAIMessages(
  rows: MessageRow[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  let i = 0;

  while (i < rows.length) {
    const row = rows[i];

    if (row.role === "assistant" && row.toolCallId) {
      const toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] =
        [];
      while (
        i < rows.length && rows[i].role === "assistant" && rows[i].toolCallId
      ) {
        toolCalls.push({
          id: rows[i].toolCallId!,
          type: "function",
          function: {
            name: rows[i].toolName!,
            arguments: rows[i].content ?? "",
          },
        });
        i++;
      }
      result.push({ role: "assistant", content: null, tool_calls: toolCalls });
    } else if (row.role === "tool") {
      result.push({
        role: "tool",
        tool_call_id: row.toolCallId!,
        content: row.content ?? "",
      });
      i++;
    } else {
      result.push({
        role: row.role as "user" | "assistant",
        content: row.content ?? "",
      });
      i++;
    }
  }

  return result;
}
