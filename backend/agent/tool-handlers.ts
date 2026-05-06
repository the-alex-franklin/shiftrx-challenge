import { db } from "../db/client.ts";
import { calloffs, providers, shifts } from "../db/schema.ts";
import { and, eq, gte, lte, not } from "drizzle-orm";

export async function executeTool(
  name: string,
  args: Record<string, string>,
): Promise<string> {
  try {
    switch (name) {
      case "get_shifts": {
        const result = await db.query.shifts.findMany({
          where: and(
            gte(shifts.startTime, new Date(args.start)),
            lte(shifts.startTime, new Date(args.end)),
          ),
          with: { provider: true },
        });
        return JSON.stringify(result);
      }
      case "get_coverage_candidates": {
        const shift = await db.query.shifts.findFirst({
          where: eq(shifts.id, args.shift_id),
        });
        if (!shift) return JSON.stringify({ error: "Shift not found" });

        const candidates = await db.query.providers.findMany({
          where: shift.providerId
            ? and(
              eq(providers.role, shift.role),
              not(eq(providers.id, shift.providerId)),
            )
            : eq(providers.role, shift.role),
        });

        return JSON.stringify(candidates);
      }
      case "assign_provider": {
        const result = await db.update(shifts)
          .set({ providerId: args.provider_id, status: "filled" })
          .where(eq(shifts.id, args.shift_id))
          .returning();
        if (!result[0]) return JSON.stringify({ error: "Shift not found" });
        return JSON.stringify(result[0]);
      }
      case "report_calloff": {
        const calloff = await db.insert(calloffs).values({
          shiftId: args.shift_id,
          reportedBy: args.provider_id,
          reason: args.reason,
        }).returning();
        await db.update(shifts)
          .set({ status: "uncovered" })
          .where(eq(shifts.id, args.shift_id));
        return JSON.stringify(calloff[0]);
      }
      case "create_shift": {
        const result = await db.insert(shifts).values({
          providerId: args.provider_id,
          startTime: new Date(args.start_time),
          endTime: new Date(args.end_time),
          role: args.role,
          notes: args.notes,
          status: "scheduled",
        }).returning();
        return JSON.stringify(result[0]);
      }
      case "cancel_shift": {
        const result = await db.update(shifts)
          .set({ providerId: null, status: "cancelled" })
          .where(eq(shifts.id, args.shift_id))
          .returning();
        if (!result[0]) return JSON.stringify({ error: "Shift not found" });
        return JSON.stringify(result[0]);
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: (err as Error).message });
  }
}
