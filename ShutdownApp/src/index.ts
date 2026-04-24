import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { commandRegistry } from "./commands/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();
const PORT = 1234;

// Serve static UI files
app.get("/", (c) => {
  const htmlPath = join(__dirname, "ui", "index.html");
  const html = readFileSync(htmlPath, "utf-8");
  return c.html(html);
});

app.get("/ui/style.css", (c) => {
  const cssPath = join(__dirname, "ui", "style.css");
  const css = readFileSync(cssPath, "utf-8");
  return c.text(css, 200, { "Content-Type": "text/css" });
});

app.get("/ui/script.js", (c) => {
  const jsPath = join(__dirname, "ui", "script.js");
  const js = readFileSync(jsPath, "utf-8");
  return c.text(js, 200, { "Content-Type": "application/javascript" });
});

// API Routes

// Get available commands
app.get("/api/commands", (c) => {
  const commands = commandRegistry.getAvailableCommands();
  return c.json(commands);
});

// Get system status
app.get("/api/status", async (c) => {
  const result = await commandRegistry.execute("status");
  return c.json(result);
});

// Execute command
app.post("/api/command/:name", async (c) => {
  const commandName = c.req.param("name");
  const body = await c.req.json().catch(() => ({}));

  const result = await commandRegistry.execute(commandName, body);
  return c.json(result);
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
console.log(`
╔════════════════════════════════════════╗
║   JARVIS System Control Interface      ║
║   Starting on port ${PORT}                ║
║   Visit: http://localhost:${PORT}      ║
╚════════════════════════════════════════╝
`);

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`✓ Server running on http://localhost:${info.port}`);
  }
);
