import { Hono } from "hono";
import { Try } from "@2or3godzillas/utils";
import { db } from "../db/client.ts";
import { calloffs, providers, shifts } from "../db/schema.ts";
import { and, eq, gte, lte, not } from "drizzle-orm";

const shiftsRouter = new Hono();

shiftsRouter.get("/", async (c) => {
  const { start, end } = c.req.query();

  if (!start) return c.json({ error: "start query param required" }, 400);
  if (!end) return c.json({ error: "end query param required" }, 400);

  const result = await Try(async () =>
    await db.query.shifts.findMany({
      where: and(
        gte(shifts.startTime, new Date(start)),
        lte(shifts.endTime, new Date(end)),
      ),
      with: { provider: true },
    })
  );

  if (result.failure) return c.json({ error: result.error.message }, 500);
  return c.json(result.data);
});

shiftsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { providerId, startTime, endTime, role, notes } = body;

  if (!providerId) return c.json({ error: "providerId is required" }, 400);
  if (!startTime) return c.json({ error: "startTime is required" }, 400);
  if (!endTime) return c.json({ error: "endTime is required" }, 400);
  if (!role) return c.json({ error: "role is required" }, 400);

  const result = await Try(async () =>
    await db.insert(shifts).values({
      providerId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      role,
      notes,
    }).returning()
  );

  if (result.failure) return c.json({ error: result.error.message }, 500);
  return c.json(result.data[0], 201);
});

shiftsRouter.patch("/:id/status", async (c) => {
  const { id } = c.req.param();
  const { status } = await c.req.json();

  const result = await Try(async () =>
    await db.update(shifts)
      .set({ status })
      .where(eq(shifts.id, id))
      .returning()
  );

  if (result.failure) return c.json({ error: result.error.message }, 500);
  if (!result.data[0]) return c.json({ error: "Shift not found" }, 400);
  return c.json(result.data[0]);
});

shiftsRouter.post("/:id/calloff", async (c) => {
  const { id } = c.req.param();
  const { providerId, reason } = await c.req.json();

  if (!providerId) return c.json({ error: "providerId required" }, 400);

  const calloffResult = await Try(async () =>
    await db.insert(calloffs).values({
      shiftId: id,
      reportedBy: providerId,
      reason,
    }).returning()
  );

  if (calloffResult.failure) {
    return c.json({ error: calloffResult.error.message }, 500);
  }

  const statusResult = await Try(async () =>
    await db.update(shifts)
      .set({ status: "cancelled" })
      .where(eq(shifts.id, id))
      .returning()
  );

  if (statusResult.failure) {
    return c.json({ error: statusResult.error.message }, 500);
  }

  return c.json(
    { calloff: calloffResult.data[0], shift: statusResult.data[0] },
    201,
  );
});

shiftsRouter.get("/:id/coverage", async (c) => {
  const { id } = c.req.param();

  const shiftResult = await Try(async () =>
    await db.query.shifts.findFirst({
      where: eq(shifts.id, id),
    })
  );

  if (shiftResult.failure) {
    return c.json({ error: shiftResult.error.message }, 500);
  }
  if (!shiftResult.data) return c.json({ error: "Shift not found" }, 400);

  const shift = shiftResult.data;

  const coverageResult = await Try(async () =>
    await db.query.providers.findMany({
      where: and(
        eq(providers.role, shift.role),
        not(eq(providers.id, shift.providerId!)),
      ),
    })
  );

  if (coverageResult.failure) {
    return c.json({ error: coverageResult.error.message }, 500);
  }

  return c.json(coverageResult.data);
});

shiftsRouter.post("/:id/assign", async (c) => {
  const { id } = c.req.param();
  const { providerId } = await c.req.json();

  if (!providerId) return c.json({ error: "providerId required" }, 400);

  const result = await Try(async () =>
    await db.update(shifts)
      .set({ providerId, status: "scheduled" })
      .where(eq(shifts.id, id))
      .returning()
  );

  if (result.failure) return c.json({ error: result.error.message }, 500);
  if (!result.data[0]) return c.json({ error: "Shift not found" }, 400);
  return c.json(result.data[0]);
});

export { shiftsRouter };
