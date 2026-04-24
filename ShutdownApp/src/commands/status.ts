import os from "os";
import { BaseCommand, CommandResult } from "./base.js";

export class StatusCommand extends BaseCommand {
  metadata = {
    name: "status",
    description: "Get system status",
    icon: "📊",
  };

  async execute(): Promise<CommandResult> {
    try {
      const uptime = os.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      return {
        success: true,
        message: "System is online",
        data: {
          hostname: os.hostname(),
          platform: os.platform(),
          arch: os.arch(),
          uptime: `${hours}h ${minutes}m ${seconds}s`,
          cpus: os.cpus().length,
          totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
          freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
          loadAverage: os.loadavg(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get status: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
