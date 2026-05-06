import OpenAI from "openai";
import { getHollySystem } from "../agent/holly.ts";
import { TOOLS } from "../agent/tools.ts";

export type Scenario = {
  name: string;
  userMessage: string;
  expectedTool: string;
  mockToolResponse: string;
  expectResponseToMatch?: RegExp;
};

export type EvalResult = {
  scenario: string;
  passed: boolean;
  toolSelected: string;
  expectedTool: string;
  response: string;
  error?: string;
};

export async function runScenario(
  openai: OpenAI,
  scenario: Scenario,
): Promise<EvalResult> {
  const base: EvalResult = {
    scenario: scenario.name,
    passed: false,
    toolSelected: "(none)",
    expectedTool: scenario.expectedTool,
    response: "",
  };

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    getHollySystem(),
    { role: "user", content: scenario.userMessage },
  ];

  let first: OpenAI.Chat.Completions.ChatCompletion;
  try {
    first = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: TOOLS,
    });
  } catch (err) {
    return { ...base, error: `API error: ${(err as Error).message}` };
  }

  const choice = first.choices[0];
  if (
    choice.finish_reason !== "tool_calls" || !choice.message.tool_calls?.length
  ) {
    return {
      ...base,
      toolSelected: "(no tool call)",
      response: choice.message.content ?? "",
      error: `Expected tool call, got plain response`,
    };
  }

  const firstCall = choice.message.tool_calls[0];
  const toolSelected = firstCall.function.name;
  const toolCorrect = toolSelected === scenario.expectedTool;

  // Inject mock tool response and get Holly's final reply
  const withToolResult: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    ...messages,
    { role: "assistant", content: null, tool_calls: choice.message.tool_calls },
    {
      role: "tool",
      tool_call_id: firstCall.id,
      content: scenario.mockToolResponse,
    },
  ];

  let second: OpenAI.Chat.Completions.ChatCompletion;
  try {
    second = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: withToolResult,
      tools: TOOLS,
    });
  } catch (err) {
    return {
      ...base,
      toolSelected,
      passed: toolCorrect,
      error: `Tool correct but second call failed: ${(err as Error).message}`,
    };
  }

  const finalContent = second.choices[0].message.content ?? "";
  const responseOk = !scenario.expectResponseToMatch ||
    scenario.expectResponseToMatch.test(finalContent);

  return {
    ...base,
    toolSelected,
    passed: toolCorrect && responseOk,
    response: finalContent,
    error: !toolCorrect
      ? `Wrong tool selected`
      : !responseOk
      ? `Response didn't match ${scenario.expectResponseToMatch}`
      : undefined,
  };
}
