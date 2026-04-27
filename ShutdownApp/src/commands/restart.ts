import { exec } from "child_process";
import { promisify } from "util";
import { BaseCommand, CommandResult } from "./base.js";

const execAsync = promisify(exec);

export class RestartCommand extends BaseCommand {
  metadata = {
    name: "restart",
    description: "Restart the computer",
    icon: "🔄",
  };

  async execute(args?: Record<string, unknown>): Promise<CommandResult> {
    try {
      const password = args?.password as string;
      if (!process.env.SYSTEM_PASSWORD || password !== process.env.SYSTEM_PASSWORD) {
        return {
          success: false,
          message: "Unauthorized: Invalid system password",
        };
      }

      const delay = (args?.delay as number) || 0;

      if (delay > 0) {
        await execAsync(`shutdown /r /t ${delay}`);
        return {
          success: true,
          message: `Computer will restart in ${delay} seconds`,
        };
      } else {
        await execAsync("shutdown /r /t 0");
        return {
          success: true,
          message: "Computer is restarting now",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to restart: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
