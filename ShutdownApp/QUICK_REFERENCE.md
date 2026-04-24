# 🚀 JARVIS Quick Reference

## Getting Started (30 seconds)

```bash
cd ShutdownApp
npm run dev
# Open http://localhost:1234 in your browser
```

## Common Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Start with hot-reload
npm start            # Run compiled code
npm run type-check   # Check for errors
```

## Server Info

- **Port:** 1234
- **URL:** http://localhost:1234
- **API Base:** http://localhost:1234/api/

## API Quick Reference

```bash
# Get commands
curl http://localhost:1234/api/commands

# Get status
curl http://localhost:1234/api/status

# Shutdown (60 second delay)
curl -X POST http://localhost:1234/api/command/shutdown \
  -H "Content-Type: application/json" \
  -d '{"delay": 60}'

# Restart
curl -X POST http://localhost:1234/api/command/restart \
  -H "Content-Type: application/json" \
  -d '{}'

# Health check
curl http://localhost:1234/health
```

## Add a Custom Command

1. Create `src/commands/mycommand.ts`
2. Add to `src/commands/registry.ts`
3. Run `npm run build && npm run dev`
4. Command appears on dashboard

See `PLUGIN_DEVELOPMENT.md` for examples.

## Documentation Files

- **README.md** - Features & overview
- **CLOUDFLARE_TUNNEL_SETUP.md** - Remote access setup
- **PLUGIN_DEVELOPMENT.md** - Custom commands guide
- **STARTUP.md** - Auto-startup setup
- **IMPLEMENTATION_SUMMARY.md** - Full build details

## File Structure

```
src/
├── index.ts              # Main server
├── commands/
│   ├── base.ts          # Command interface
│   ├── registry.ts      # Command registry
│   ├── shutdown.ts
│   ├── restart.ts
│   └── status.ts
└── ui/
    ├── index.html
    ├── style.css
    └── script.js
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 1234 in use | Change in `src/index.ts`, rebuild |
| TypeScript errors | Run `npm run type-check` |
| Dashboard won't load | Clear cache (Ctrl+Shift+Del) |
| Command not appearing | Rebuild with `npm run build` |

## Deploy Checklist

- [ ] Local testing works (`npm run dev`)
- [ ] Custom commands added (optional)
- [ ] Cloudflare Tunnel configured (for remote)
- [ ] Auto-startup enabled (optional)
- [ ] Tested from another computer (if remote)

## Useful Links

- Hono: https://hono.dev/
- Cloudflare: https://www.cloudflare.com/
- Node.js: https://nodejs.org/

---

**Version 1.1.0 | Powered by Hono + TypeScript + Cloudflare**
