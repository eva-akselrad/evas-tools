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
