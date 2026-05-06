import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").references(() => providers.id),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const providersRelations = relations(providers, ({ many }) => ({
  shifts: many(shifts),
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
  provider: one(providers, {
    fields: [shifts.providerId],
    references: [providers.id],
  }),
}));

export const calloffs = pgTable("calloffs", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftId: uuid("shift_id").references(() => shifts.id),
  reportedBy: uuid("reported_by").references(() => providers.id),
  reason: text("reason"),
  reportedAt: timestamp("reported_at", { withTimezone: true }).defaultNow(),
  resolved: boolean("resolved").default(false),
  resolvedBy: uuid("resolved_by").references(() => providers.id),
  resolutionNotes: text("resolution_notes"),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull(),
  content: text("content"),
  toolCallId: text("tool_call_id"),
  toolName: text("tool_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
