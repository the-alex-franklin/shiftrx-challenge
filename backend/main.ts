import { Hono } from "hono";
import { shiftsRouter } from "./routers/shifts.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date() }));

app.route("/api/shifts", shiftsRouter);

Deno.serve(app.fetch);
