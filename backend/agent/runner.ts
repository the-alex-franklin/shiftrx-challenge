import OpenAI from "openai";
import { db } from "../db/client.ts";
import { messages } from "../db/schema.ts";
import { asc } from "drizzle-orm";
import { getHollySystem } from "./holly.ts";
import { TOOLS } from "./tools.ts";
import { executeTool } from "./tool-handlers.ts";

type MessageRow = typeof messages.$inferSelect;

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

export async function runHolly(
  openai: OpenAI,
  message: string,
): Promise<string> {
  await db.insert(messages).values({ role: "user", content: message });

  const getHistory = async () =>
    toOpenAIMessages(
      await db.query.messages.findMany({ orderBy: [asc(messages.createdAt)] }),
    );

  let response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [getHollySystem(), ...await getHistory()],
    tools: TOOLS,
  });

  while (response.choices[0].finish_reason === "tool_calls") {
    const toolCalls = response.choices[0].message.tool_calls!;

    for (const call of toolCalls) {
      await db.insert(messages).values({
        role: "assistant",
        toolCallId: call.id,
        toolName: call.function.name,
        content: call.function.arguments,
      });
    }

    for (const call of toolCalls) {
      const args = JSON.parse(call.function.arguments);
      const result = await executeTool(call.function.name, args);
      await db.insert(messages).values({
        role: "tool",
        toolCallId: call.id,
        toolName: call.function.name,
        content: result,
      });
    }

    response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [getHollySystem(), ...await getHistory()],
      tools: TOOLS,
    });
  }

  const finalContent = response.choices[0].message.content ?? "";
  await db.insert(messages).values({
    role: "assistant",
    content: finalContent,
  });
  return finalContent;
}
