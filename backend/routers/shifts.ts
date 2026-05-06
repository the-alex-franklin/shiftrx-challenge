import { Hono } from "hono";
import { Try } from "@2or3godzillas/utils";
import { db } from "../db/client.ts";
import { shifts } from "../db/schema.ts";
import { and, gte, lte } from "drizzle-orm";

const shiftsRouter = new Hono();

shiftsRouter.get("/", async (c) => {
  const { start, end } = c.req.query();

  if (!start) return c.json({ error: "start query param required" }, 400);
  if (!end) return c.json({ error: "end query param required" }, 400);

  const result = await Try(async () =>
    await db.query.shifts.findMany({
      where: and(
        gte(shifts.startTime, new Date(start)),
        lte(shifts.startTime, new Date(end)),
      ),
      with: { provider: true },
    })
  );

  if (result.failure) return c.json({ error: result.error.message }, 500);
  return c.json(result.data);
});

export { shiftsRouter };
