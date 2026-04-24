import { BaseCommand, CommandResult, CommandMetadata } from "./base.js";
import { ShutdownCommand } from "./shutdown.js";
import { RestartCommand } from "./restart.js";
import { StatusCommand } from "./status.js";

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
    ];

    for (const command of defaultCommands) {
      this.register(command.metadata.name, command);
    }
  }

  register(name: string, command: BaseCommand): void {
    this.commands.set(name, command);
  }

  async execute(
    name: string,
    args?: Record<string, unknown>
  ): Promise<CommandResult> {
    const command = this.commands.get(name);

    if (!command) {
      return {
        success: false,
        message: `Command "${name}" not found`,
      };
    }

    try {
      return await command.execute(args);
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  getAvailableCommands(): CommandMetadata[] {
    return Array.from(this.commands.values()).map((cmd) => cmd.metadata);
  }
}

export const commandRegistry = new CommandRegistry();
