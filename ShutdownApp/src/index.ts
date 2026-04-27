import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { commandRegistry } from "./commands/registry.js";
import { jackettService } from "./services/jackett.js";
import { qBittorrentService } from "./services/qbittorrent.js";

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

app.get("/manifest.json", (c) => {
  const manifestPath = join(__dirname, "ui", "manifest.json");
  const manifest = readFileSync(manifestPath, "utf-8");
  return c.text(manifest, 200, { "Content-Type": "application/json" });
});

app.get("/sw.js", (c) => {
  const swPath = join(__dirname, "ui", "sw.js");
  const sw = readFileSync(swPath, "utf-8");
  return c.text(sw, 200, { "Content-Type": "application/javascript" });
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

// Torrent Routes
app.get("/api/torrents/search", async (c) => {
  const query = c.req.query("q");
  const category = c.req.query("category");

  if (!query) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  try {
    const results = await jackettService.search(query, category);
    return c.json(results);
  } catch (error) {
    return c.json({ error: "Failed to search Jackett" }, 500);
  }
});

app.post("/api/torrents/download", async (c) => {
  const body = await c.req.json();
  const { link, title, category } = body;

  if (!link) {
    return c.json({ success: false, message: "Link is required" }, 400);
  }

  try {
    // Add to qBittorrent
    const added = await qBittorrentService.addTorrent(link, category || "others");
    
    if (added) {
      return c.json({ 
        success: true, 
        message: `Successfully added "${title || 'torrent'}" to qBittorrent (${category || 'others'}).` 
      });
    } else {
      return c.json({ 
        success: false, 
        message: "Failed to add torrent to qBittorrent. Please check connection and credentials." 
      });
    }
  } catch (error) {
    console.error("Download Route Error:", error);
    return c.json({ success: false, message: "Internal server error during download process." }, 500);
  }
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
