import { Hono } from "hono";
import OpenAI from "openai";
import { db } from "../db/client.ts";
import { messages } from "../db/schema.ts";
import { asc } from "drizzle-orm";
import { env_vars } from "../env.ts";
import { runHolly, toOpenAIMessages } from "../agent/runner.ts";

const chatRouter = new Hono();
const openai = new OpenAI({ apiKey: env_vars.OPENAI_API_KEY });

chatRouter.get("/", async (c) => {
  const history = await db.query.messages.findMany({
    orderBy: [asc(messages.createdAt)],
  });
  return c.json(toOpenAIMessages(history));
});

chatRouter.post("/", async (c) => {
  const { message } = await c.req.json();
  if (!message) return c.json({ error: "message is required" }, 400);

  const reply = await runHolly(openai, message);
  return c.json({ message: reply });
});

export { chatRouter };
