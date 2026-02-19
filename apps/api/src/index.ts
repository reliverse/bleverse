import { serve } from "bun";

const port = Number(process.env.PORT ?? 3001);
const service = "bleverse-api";

serve({
  port,
  fetch(req) {
    const u = new URL(req.url);
    const host = req.headers.get("host") ?? "unknown";

    if (u.pathname === "/health") {
      return Response.json({ ok: true, service, port, host });
    }

    return Response.json({ ok: true, service, path: u.pathname, host, port });
  },
});

console.log(`⚡️ [${service}] http://localhost:${port}/`);
