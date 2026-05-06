import { db } from "./client.ts";
import { providers, shifts } from "./schema.ts";
import { addDays, setHours, startOfWeek } from "date-fns";

await db.delete(shifts);
await db.delete(providers);

const [okafor, reyes, lindqvist, chen, patel, russo] = await db.insert(
  providers,
).values([
  { name: "Dr. Okafor", role: "Physician", email: "okafor@shiftrx.com" },
  { name: "N. Reyes", role: "Nurse", email: "reyes@shiftrx.com" },
  { name: "T. Lindqvist", role: "Tech", email: "lindqvist@shiftrx.com" },
  { name: "M. Chen", role: "Nurse", email: "chen@shiftrx.com" },
  { name: "Dr. Patel", role: "Physician", email: "patel@shiftrx.com" },
  { name: "Dr. Russo", role: "Physician", email: "russo@shiftrx.com" },
]).returning();

const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

function shift(
  provider: typeof okafor,
  dayOffset: number,
  startHour: number,
  endHour: number,
  status = "scheduled",
) {
  const day = addDays(monday, dayOffset);
  return {
    providerId: provider.id,
    role: provider.role,
    startTime: setHours(day, startHour),
    endTime: setHours(day, endHour),
    status,
  };
}

await db.insert(shifts).values([
  shift(okafor, 0, 7, 15),
  shift(reyes, 0, 7, 19),
  shift(lindqvist, 0, 15, 23),
  shift(okafor, 1, 7, 15),
  shift(chen, 1, 11, 23, "cancelled"),
  shift(patel, 2, 15, 23),
  shift(reyes, 2, 7, 19),
  shift(lindqvist, 3, 7, 15),
  shift(russo, 3, 7, 19, "uncovered"),
  shift(chen, 4, 7, 15),
  shift(patel, 4, 15, 23),
]);

console.log("Seeded database");
Deno.exit(0);
