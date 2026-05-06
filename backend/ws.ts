import { Hono } from "hono";
import { upgradeWebSocket } from "hono/deno";
import type { WSContext } from "hono/ws";

const connections = new Set<WSContext>();

export function broadcast(data: unknown) {
  const msg = JSON.stringify(data);
  for (const ws of connections) {
    try {
      ws.send(msg);
    } catch {
      connections.delete(ws);
    }
  }
}

const wsRouter = new Hono();

wsRouter.get(
  "/",
  upgradeWebSocket(() => ({
    onOpen(_evt, ws) {
      connections.add(ws);
    },
    onClose(_evt, ws) {
      connections.delete(ws);
    },
  })),
);

export { wsRouter };
