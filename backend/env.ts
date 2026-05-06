import { z } from "npm:zod";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

export const env_vars = z.object({
  OPENAI_API_KEY: z.string(),
  DATABASE_URL: z.string(),
}).parse(Deno.env.toObject());
