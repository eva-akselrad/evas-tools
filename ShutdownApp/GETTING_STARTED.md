# JARVIS System Control - Getting Started

Welcome to **JARVIS**, your futuristic system control interface! This file will get you up and running in minutes.

## 🎯 What is JARVIS?

JARVIS is a sci-fi themed web dashboard for controlling your Windows computer remotely and locally. Features include:

- 🎨 **Futuristic UI** with neon colors and animations
- ⚡ **Instant Control** - Shutdown, restart, lock your computer
- 📊 **Live Monitoring** - Check uptime, CPU, memory, system info
- 🔌 **Extensible** - Add custom commands in minutes
- 🌐 **Remote Access** - Use via Cloudflare Tunnel from anywhere
- 🔐 **Secure** - Cloudflare Zero Trust authentication

## ⚡ Quick Start (2 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Project
```bash
npm run build
```

### Step 3: Start the Server
```bash
npm run dev
```

### Step 4: Open in Browser
```
http://localhost:1234
```

**That's it!** You should see the JARVIS dashboard with command cards.

## 📚 Documentation Guide

Choose what you want to do:

### I want to...

**Use JARVIS locally right now**
→ You're done! Just opened http://localhost:1234

**Access JARVIS from anywhere (remote)**
→ Read `CLOUDFLARE_TUNNEL_SETUP.md` (15 min setup)

**Start JARVIS automatically at boot**
→ Read `STARTUP.md` (5 min setup)

**Add custom commands (lock, sleep, etc.)**
→ Read `PLUGIN_DEVELOPMENT.md` (see examples)

**Understand how it works**
→ Read `README.md` (full feature overview)

**Quick command reference**
→ Read `QUICK_REFERENCE.md` (API & commands)

## 🎮 Try It Out

### On the Dashboard
1. Click any command card (Shutdown, Restart, Status)
2. Watch the animation as it executes
3. See the result message

### Via API
```bash
# Get all commands
curl http://localhost:1234/api/commands

# Get system status
curl http://localhost:1234/api/status

# Shutdown (with 60 second delay)
curl -X POST http://localhost:1234/api/command/shutdown \
  -H "Content-Type: application/json" \
  -d '{"delay": 60}'
```

## 🔧 File Locations

Important files you might need:

```
ShutdownApp/
├── src/
│   ├── index.ts              ← Main server
│   ├── commands/             ← Where commands live
│   │   ├── registry.ts       ← Register new commands here
│   │   ├── shutdown.ts
│   │   ├── restart.ts
│   │   └── status.ts
│   └── ui/
│       ├── index.html        ← Dashboard layout
│       ├── style.css         ← Styling & colors
│       └── script.js         ← Dashboard interactivity
└── [Documentation]
    ├── README.md             ← Full documentation
    ├── CLOUDFLARE_TUNNEL_SETUP.md
    ├── PLUGIN_DEVELOPMENT.md
    └── STARTUP.md
```

## 🚀 Common Tasks

### Task 1: Change Server Port

Edit `src/index.ts`:
```typescript
const PORT = 9000;  // Change from 1234
```

Rebuild: `npm run build`

### Task 2: Add a Custom Command (Lock Screen)

1. Create `src/commands/lock.ts`:
```typescript
import { BaseCommand } from "./base.js";

export class LockCommand extends BaseCommand {
  metadata = {
    name: "lock",
    description: "Lock the computer",
    icon: "🔒",
  };

  async execute() {
    // Implementation here
    return { success: true, message: "Locked" };
  }
}
```

2. Register in `src/commands/registry.ts`:
```typescript
const defaultCommands = [
  // ...existing commands...
  new LockCommand(),
];
```

3. Rebuild and restart:
```bash
npm run build && npm run dev
```

Your lock command now appears on the dashboard!

### Task 3: Enable Remote Access (Cloudflare)

1. Read `CLOUDFLARE_TUNNEL_SETUP.md` for step-by-step instructions
2. Takes about 15 minutes to set up
3. Result: Access via `https://jarvis.yourdomain.com` from anywhere
4. Secured with authentication (email OTP or SSO)

### Task 4: Auto-Start at Boot

1. Read `STARTUP.md`
2. 3 options: Task Scheduler GUI, PowerShell, or Command Prompt
3. Takes 5 minutes

## 💡 Pro Tips

✅ **Use keyboard shortcuts:** The dashboard supports fast command execution
✅ **Monitor regularly:** Check status endpoint: `curl http://localhost:1234/api/status`
✅ **Extend often:** Add custom commands for your workflow
✅ **Secure remote access:** Always use Cloudflare for remote, not direct port forwarding
✅ **Keep updated:** Periodically `npm update` for dependency updates

## 🆘 Troubleshooting

**Can't start server?**
- Check Node.js installed: `node --version` (needs 18+)
- Check port 1234 free: `netstat -ano | findstr :1234`
- Reinstall deps: `npm install`

**Dashboard won't load?**
- Check server running: Look for "Server running on" message
- Clear browser cache: Ctrl+Shift+Del
- Try different browser

**Commands not working?**
- Check console for errors (F12 in browser)
- Test API directly: `curl http://localhost:1234/api/commands`
- Rebuild project: `npm run build`

See full troubleshooting in `README.md`

## 📖 Next Steps

1. **Try different commands** on the dashboard
2. **Read documentation** for the features you want
3. **Set up Cloudflare** if you want remote access
4. **Add custom commands** for your specific needs
5. **Enable auto-startup** for hands-free operation

## 📞 Need Help?

1. Check `QUICK_REFERENCE.md` for command examples
2. Read `README.md` for full documentation
3. See `PLUGIN_DEVELOPMENT.md` if adding commands
4. Check `CLOUDFLARE_TUNNEL_SETUP.md` for remote access

## 🎉 You're Ready!

Your JARVIS system is ready to use. Start with:

```bash
npm run dev
```

Then open: **http://localhost:1234**

Enjoy your futuristic control interface! 🚀

---

**Questions?** Check the documentation files or the source code—it's well-organized and easy to understand!

**Version 1.0.0** | Built with Hono + TypeScript + Cloudflare
