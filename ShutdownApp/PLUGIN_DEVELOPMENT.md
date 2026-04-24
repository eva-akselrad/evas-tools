# Plugin Development Guide - JARVIS System Control

This guide explains how to create new commands for the JARVIS system control interface.

## Overview

JARVIS uses a **plugin/command registry system** that makes it trivial to add new functionality without modifying core code. Each command is a self-contained class that inherits from `BaseCommand`.

## Architecture

```
JARVIS System
├── Command Registry (registry.ts)
│   ├── Shutdown Command
│   ├── Restart Command
│   ├── Status Command
│   └── [Your Custom Commands]
├── Hono Server (index.ts)
│   ├── GET /api/commands
│   ├── POST /api/command/:name
│   └── GET /api/status
└── Web UI (ui/)
    ├── Command cards
    ├── Status panel
    └── Real-time feedback
```

## Creating a Custom Command

### Step 1: Understand the Base Class

All commands inherit from `BaseCommand`:

```typescript
export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface CommandMetadata {
  name: string;
  description: string;
  icon?: string;
}

export abstract class BaseCommand {
  abstract metadata: CommandMetadata;
  abstract execute(args?: Record<string, unknown>): Promise<CommandResult>;
}
```

### Step 2: Create Your Command File

Create a new file in `src/commands/` directory:

**File:** `src/commands/lock.ts`

```typescript
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class LockCommand extends BaseCommand {
  // Define metadata (shown on UI)
  metadata = {
    name: "lock",
    description: "Lock the computer",
    icon: "🔒",
  };

  // Implement execute method
  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      // Lock Windows using rundll32
      await execAsync("rundll32.exe user32.dll,LockWorkStation");

      return {
        success: true,
        message: "Computer locked successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to lock: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

### Step 3: Register Your Command

Edit `src/commands/registry.ts` and add your command to the registry:

```typescript
import { BaseCommand, CommandResult, CommandMetadata } from "./base.js";
import { ShutdownCommand } from "./shutdown.js";
import { RestartCommand } from "./restart.js";
import { StatusCommand } from "./status.js";
import { LockCommand } from "./lock.js"; // Add import

class CommandRegistry {
  private commands: Map<string, BaseCommand> = new Map();

  constructor() {
    this.registerDefaultCommands();
  }

  private registerDefaultCommands() {
    const defaultCommands = [
      new ShutdownCommand(),
      new RestartCommand(),
      new StatusCommand(),
      new LockCommand(), // Add your command here
    ];

    for (const command of defaultCommands) {
      this.register(command.metadata.name, command);
    }
  }

  // ... rest of the code
}
```

### Step 4: Build and Test

```bash
# Build the project
npm run build

# If successful, start the server
npm run dev

# Test your command
curl -X POST "http://localhost:1234/api/command/lock" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Your new command will automatically appear on the JARVIS dashboard!

## Command Examples

### 1. Sleep Command

```typescript
// src/commands/sleep.ts
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class SleepCommand extends BaseCommand {
  metadata = {
    name: "sleep",
    description: "Put computer to sleep",
    icon: "😴",
  };

  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      await execAsync("rundll32.exe powrprof.dll,SetSuspendState 0,1,0");
      return {
        success: true,
        message: "Computer is going to sleep",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to sleep: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

### 2. Hibernate Command

```typescript
// src/commands/hibernate.ts
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class HibernateCommand extends BaseCommand {
  metadata = {
    name: "hibernate",
    description: "Hibernate the computer",
    icon: "❄️",
  };

  async execute(): Promise<CommandResult> {
    try {
      await execAsync("shutdown /h");
      return {
        success: true,
        message: "Computer is hibernating",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to hibernate: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

### 3. Volume Control Command

```typescript
// src/commands/volume.ts
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class VolumeCommand extends BaseCommand {
  metadata = {
    name: "volume",
    description: "Control system volume",
    icon: "🔊",
  };

  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      const level = (args?.level as number) || 50; // 0-100

      // Using nircmd (need to install separately) or PowerShell
      await execAsync(
        `powershell -Command "$(Get-Volume -CimSession (New-CimSession)).Volume = ${level}"`
      );

      return {
        success: true,
        message: `Volume set to ${level}%`,
        data: { volume: level },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set volume: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

### 4. Application Launcher

```typescript
// src/commands/launch-app.ts
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class LaunchAppCommand extends BaseCommand {
  metadata = {
    name: "launch-app",
    description: "Launch a specific application",
    icon: "🚀",
  };

  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      const appPath = args?.path as string;

      if (!appPath) {
        return {
          success: false,
          message: "App path is required",
        };
      }

      await execAsync(`"${appPath}"`);

      return {
        success: true,
        message: `Launched ${appPath}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to launch app: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

### 5. Custom Script Executor

```typescript
// src/commands/run-script.ts
import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class RunScriptCommand extends BaseCommand {
  metadata = {
    name: "run-script",
    description: "Run a custom script or batch file",
    icon: "⚙️",
  };

  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      const scriptPath = args?.script as string;

      if (!scriptPath) {
        return {
          success: false,
          message: "Script path is required",
        };
      }

      const { stdout } = await execAsync(scriptPath);

      return {
        success: true,
        message: "Script executed successfully",
        data: { output: stdout },
      };
    } catch (error) {
      return {
        success: false,
        message: `Script failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
```

## Best Practices

### 1. Error Handling

Always wrap command execution in try-catch and return meaningful error messages:

```typescript
try {
  // Execute command
  await execAsync("some-command");
  return { success: true, message: "Done" };
} catch (error) {
  return {
    success: false,
    message: `Failed: ${error instanceof Error ? error.message : String(error)}`,
  };
}
```

### 2. Icon Selection

Use relevant Unicode emojis for command icons:

- System: ⚙️, 🔧, 🛠️
- Power: ⏹️, 🔄, ⏻️, 🔌
- Security: 🔒, 🔓, 🛡️
- Media: 🔊, 🔇, 📺
- Files: 📁, 📄, 💾
- Network: 🌐, 📡, 🔗

### 3. Command Naming

Use lowercase, hyphenated names:

- ✓ `lock-screen`, `launch-app`, `run-script`
- ✗ `LockScreen`, `launchApp`, `runScript`

### 4. Parameter Handling

Use optional arguments for flexible commands:

```typescript
async execute(args?: Record<string, unknown>): Promise<CommandResult> {
  const delay = (args?.delay as number) || 0;
  const level = (args?.level as number) || 50;
  // ...
}
```

### 5. Data in Response

Return useful data for future dashboard features:

```typescript
return {
  success: true,
  message: "Volume changed",
  data: {
    newVolume: 75,
    previousVolume: 50,
    timestamp: new Date().toISOString(),
  },
};
```

## Testing Your Command

### Manual API Test

```bash
# Get all commands
curl http://localhost:1234/api/commands

# Execute your command
curl -X POST "http://localhost:1234/api/command/your-command-name" \
  -H "Content-Type: application/json" \
  -d '{"param1": "value1"}'
```

### Browser Test

1. Start the server: `npm run dev`
2. Open http://localhost:1234
3. Your command will appear as a new card on the dashboard
4. Click the card to execute

## Advanced Topics

### Async Operations

Commands support async operations naturally:

```typescript
async execute(args?: Record<string, unknown>): Promise<CommandResult> {
  // Long-running operation
  await new Promise(resolve => setTimeout(resolve, 5000));

  return {
    success: true,
    message: "Operation completed after 5 seconds",
  };
}
```

### External APIs

You can call external services:

```typescript
import fetch from "node-fetch"; // Add to package.json if needed

async execute(): Promise<CommandResult> {
  const response = await fetch("https://api.example.com/status");
  const data = await response.json();

  return {
    success: true,
    message: "API data retrieved",
    data: data,
  };
}
```

### Conditional Logic

Build context-aware commands:

```typescript
async execute(args?: Record<string, unknown>): Promise<CommandResult> {
  const action = args?.action as string;

  if (action === "deep") {
    // Deep sleep
  } else if (action === "light") {
    // Light sleep
  } else {
    return { success: false, message: "Unknown action" };
  }

  return { success: true, message: "Done" };
}
```

## Directory Structure After Adding Commands

```
ShutdownApp/
├── src/
│   ├── commands/
│   │   ├── base.ts
│   │   ├── registry.ts
│   │   ├── shutdown.ts
│   │   ├── restart.ts
│   │   ├── status.ts
│   │   ├── lock.ts           ← Your new command
│   │   ├── sleep.ts          ← Your new command
│   │   └── launch-app.ts     ← Your new command
│   ├── ui/
│   │   ├── index.html
│   │   ├── style.css
│   │   └── script.js
│   └── index.ts
├── dist/                      (Generated after build)
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Command not appearing on dashboard

1. Check TypeScript compiles: `npm run build`
2. Verify command is registered in `registry.ts`
3. Restart server: `npm run dev`
4. Check browser console (F12) for errors

### Command execution fails silently

1. Check server console for error messages
2. Add console.log to debug: `console.log("Debug info:", args);`
3. Test API directly: `curl http://localhost:1234/api/command/your-command`

### Build errors

1. Check TypeScript errors: `npm run type-check`
2. Verify imports use `.js` extension (ESM)
3. Check that class implements all abstract methods

## Summary

Creating a new command is as simple as:

1. Create a class extending `BaseCommand`
2. Define `metadata` (name, description, icon)
3. Implement `execute()` method
4. Register in `registry.ts`
5. Run `npm run build` and restart

The new command appears instantly on the JARVIS dashboard!

Happy plugin development! 🚀
