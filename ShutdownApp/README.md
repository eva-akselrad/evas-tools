# JARVIS System Control Interface

A futuristic JARVIS-style web interface for remote system control. Manage your computer's power state, monitor system status, and extend with custom commands—all through a sleek, sci-fi dashboard secured by Cloudflare Zero Trust.

![JARVIS System Control](./docs/jarvis-screenshot.png)

## Features

- **🎨 Futuristic UI** - JARVIS-inspired dashboard with neon colors, animations, and sci-fi aesthetics
- **⚡ Real-time Controls** - Shutdown, restart, lock, and manage your system
- **📊 System Monitoring** - View uptime, CPU count, memory usage, and hostname
- **🔌 Extensible Plugin System** - Add custom commands easily without modifying core code
- **🔐 Zero Trust Security** - Protected by Cloudflare authentication—no API keys needed
- **🌐 Remote Access** - Control your computer from anywhere via Cloudflare Tunnel
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices
- **⚡ Lightweight** - Built with Hono (minimal dependencies)
- **🚀 Auto-Startup** - Runs automatically on system boot via Windows Task Scheduler

## Quick Start

### Prerequisites

- **Windows 10/11** (PowerShell/Command Prompt)
- **Node.js 18+** - Download from https://nodejs.org/
- **Cloudflare Account** (optional, for remote access)

### Local Setup (5 minutes)

```bash
# Navigate to ShutdownApp folder
cd ShutdownApp

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start the server
npm run dev
```

Open your browser: **http://localhost:1234**

## Usage

### Built-in Commands

| Command  | Icon | Description               |
| -------- | ---- | ------------------------- |
| Shutdown | ⏹️   | Shutdown the computer     |
| Restart  | 🔄   | Restart the computer      |
| Status   | 📊   | View system information   |

### Web Dashboard

- Click any command card to execute
- View real-time system status
- See command feedback and timestamps
- Responsive design works on mobile

### API Endpoints

```bash
# Get all available commands
GET /api/commands

# Get system status
GET /api/status

# Execute command (e.g., shutdown)
POST /api/command/shutdown
Body: { "delay": 60 }  # Optional: delay in seconds

# Health check
GET /health
```

## Remote Access (Cloudflare Tunnel)

### Setup (10 minutes)

1. **Read the guide:** See `CLOUDFLARE_TUNNEL_SETUP.md` for complete instructions
2. **Install cloudflared:** Download from Cloudflare
3. **Authenticate:** `cloudflared login`
4. **Create tunnel:** `cloudflared tunnel create jarvis-system-control`
5. **Configure DNS:** Add CNAME to your domain
6. **Set up Zero Trust:** Enable Cloudflare Access authentication
7. **Run tunnel:** `cloudflared tunnel run jarvis-system-control`

**Result:** Access your JARVIS dashboard from anywhere:
```
https://jarvis.yourdomain.com
```

## Extending with Custom Commands

JARVIS uses a plugin system—adding new commands is trivial!

### Example: Add a "Lock" Command

1. Create `src/commands/lock.ts`:

```typescript
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class LockCommand extends BaseCommand {
  metadata = {
    name: "lock",
    description: "Lock the computer",
    icon: "🔒",
  };

  async execute(): Promise<CommandResult> {
    try {
      await execAsync("rundll32.exe user32.dll,LockWorkStation");
      return {
        success: true,
        message: "Computer locked",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
```

2. Register in `src/commands/registry.ts`:

```typescript
import { LockCommand } from "./lock.js";

private registerDefaultCommands() {
  const defaultCommands = [
    new ShutdownCommand(),
    new RestartCommand(),
    new StatusCommand(),
    new LockCommand(), // Add this
  ];
  // ...
}
```

3. Build and restart:

```bash
npm run build
npm run dev
```

Your new command appears instantly on the dashboard! 🎉

**See `PLUGIN_DEVELOPMENT.md` for more examples and best practices.**

## Auto-Startup

### Via Windows Task Scheduler (Recommended)

See `STARTUP.md` for detailed instructions, or run:

```powershell
# PowerShell (as Administrator)
$TaskName = "JARVIS System Control"
$ScriptPath = "C:\Full\Path\To\ShutdownApp\startup.bat"
$Principal = New-ScheduledTaskPrincipal -UserID "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Action = New-ScheduledTaskAction -Execute "$ScriptPath"
Register-ScheduledTask -Principal $Principal -Trigger $Trigger -Action $Action -TaskName $TaskName -Force
```

### Alternative: Startup Batch File

Run `startup.bat` manually or create a shortcut in:

```
C:\Users\[YourUsername]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

## Architecture

```
JARVIS System Control
├── Command System (src/commands/)
│   ├── Base classes and interfaces
│   ├── Command registry (plugin loader)
│   └── Built-in commands (shutdown, restart, status)
│
├── Hono Server (src/index.ts)
│   ├── Static UI serving
│   ├── REST API endpoints
│   └── Command execution
│
├── Web UI (src/ui/)
│   ├── HTML dashboard
│   ├── Neon styling (CSS)
│   └── Interactive controls (JavaScript)
│
└── Documentation
    ├── CLOUDFLARE_TUNNEL_SETUP.md
    ├── PLUGIN_DEVELOPMENT.md
    └── STARTUP.md
```

## Security

### Local Network
- Server runs on `localhost:1234` by default
- Accessible only from your machine
- No authentication needed for local access

### Remote Access (Cloudflare)
- **Zero Trust Authentication** - Only authenticated users can access
- **Encryption in transit** - HTTPS via Cloudflare
- **No port forwarding** - Uses Cloudflare Tunnel (no open ports)
- **DDoS protection** - Cloudflare's protection included
- **Granular access control** - Set policies by email, domain, device

**Recommended:** Always use Cloudflare Zero Trust for remote access.

## Configuration

### Change Default Port

Edit `src/index.ts`:

```typescript
const PORT = 1234; // Change this
```

Then rebuild: `npm run build`

### Custom UI Styling

Edit `src/ui/style.css` to customize colors:

```css
:root {
  --primary: #00d9ff;     /* Cyan */
  --secondary: #00ffff;   /* Light cyan */
  --accent: #b300ff;      /* Purple */
}
```

### Add More Commands

See `PLUGIN_DEVELOPMENT.md` for detailed examples:
- Lock screen
- Sleep/Hibernate
- Launch applications
- Custom scripts
- Volume control
- And much more!

## Troubleshooting

### Server won't start

```bash
# Check if Node.js is installed
node --version

# Check if port 1234 is in use
netstat -ano | findstr :1234

# Install dependencies
npm install

# Check for TypeScript errors
npm run type-check
```

### Can't access dashboard

1. Verify server is running: `npm run dev`
2. Check browser: http://localhost:1234
3. Check firewall isn't blocking port 1234
4. Try different browser (clear cache)

### Cloudflare tunnel not connecting

```bash
# Check tunnel status
cloudflared tunnel status jarvis-system-control

# View logs
cloudflared tunnel logs jarvis-system-control

# Test DNS
nslookup jarvis.yourdomain.com
```

See `CLOUDFLARE_TUNNEL_SETUP.md` for detailed troubleshooting.

## Development

### Project Structure

```
ShutdownApp/
├── src/
│   ├── index.ts              # Hono server entry point
│   ├── commands/
│   │   ├── base.ts           # Base command interface
│   │   ├── registry.ts       # Command registry
│   │   ├── shutdown.ts
│   │   ├── restart.ts
│   │   └── status.ts
│   └── ui/
│       ├── index.html        # Dashboard
│       ├── style.css         # Styling
│       └── script.js         # Client logic
├── dist/                     # Compiled JavaScript (generated)
├── node_modules/             # Dependencies (git-ignored)
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Scripts

```bash
npm run dev         # Start with hot-reload (uses tsx)
npm run build       # Compile TypeScript to dist/
npm start           # Run compiled code
npm run type-check  # Check TypeScript without emitting
```

### Code Style

- **Language:** TypeScript (strict mode enabled)
- **Module format:** ES Modules (import/export)
- **Naming:** camelCase for variables/functions, PascalCase for classes
- **Comments:** Minimal—code is self-documenting
- **Async:** Always use `async`/`await` instead of `.then()`

## Performance

- **Lightweight:** ~10MB total with dependencies
- **Fast startup:** <1 second to start server
- **Low memory:** ~30-50MB runtime
- **Responsive UI:** CSS animations optimized for 60fps
- **Efficient API:** Stateless endpoints for easy scaling

## Compatibility

- **Windows 10/11:** ✓ Full support (uses Windows commands)
- **Node.js:** 18.0.0+ required (ESM support)
- **Browsers:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile:** Responsive design works on mobile browsers
- **Python/CR2 tools:** Doesn't interfere with existing Python scripts

## Future Enhancements

Potential commands to add:

- 🔒 Lock screen
- 😴 Sleep / Hibernate
- 📱 Wake-on-LAN
- 🎵 Volume control
- 🚀 Launch applications
- 📁 File management
- 📡 Network monitoring
- 🔔 Notifications
- 📅 Task scheduling
- 🎮 Gaming controls

See `PLUGIN_DEVELOPMENT.md` to implement your own!

## Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | Hono server, routes, static file serving |
| `src/commands/base.ts` | Command interface definitions |
| `src/commands/registry.ts` | Command registration and execution |
| `src/commands/shutdown.ts` | Shutdown command implementation |
| `src/commands/restart.ts` | Restart command implementation |
| `src/commands/status.ts` | Status command implementation |
| `src/ui/index.html` | Dashboard HTML |
| `src/ui/style.css` | Dashboard styling |
| `src/ui/script.js` | Dashboard interactivity |
| `CLOUDFLARE_TUNNEL_SETUP.md` | Complete Cloudflare setup guide |
| `PLUGIN_DEVELOPMENT.md` | Guide to creating custom commands |
| `STARTUP.md` | Windows auto-startup setup |

## License

MIT - See LICENSE file for details

## Contributing

Want to improve JARVIS? Feel free to:

1. Add custom commands (see `PLUGIN_DEVELOPMENT.md`)
2. Enhance UI styling
3. Report bugs or issues
4. Suggest new features

## Support

For help:

1. **Setup issues:** See relevant `.md` file (STARTUP.md, CLOUDFLARE_TUNNEL_SETUP.md)
2. **Custom commands:** See `PLUGIN_DEVELOPMENT.md`
3. **Cloudflare support:** https://developers.cloudflare.com/
4. **Hono documentation:** https://hono.dev/

## Credits

Built with:

- **Hono** - Fast edge computing framework
- **TypeScript** - Type-safe JavaScript
- **Cloudflare** - Secure tunneling and Zero Trust
- **Windows API** - Native system commands

---

**JARVIS System Control v1.0.0** - Your command, my execution. 🚀
