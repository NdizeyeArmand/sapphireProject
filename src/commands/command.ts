import { 
    Args, 
    Command as SapphireCommand, 
    CommandOptions,
    ChatInputCommand,
    ChatInputCommandContext
} from '@sapphire/framework';
import { 
    CommandInteraction, 
    Message, 
    PermissionsString,
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    AutocompleteInteraction,
    ChatInputCommandInteraction
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../lib/models/internal-models.js';

// Extend the ChatInputCommandContext to include your EventData properties
export interface CustomChatInputCommandContext extends ChatInputCommandContext {
    lang: string;
    langGuild: string;
}

// Create custom command options interface that includes your additional properties
export interface CustomCommandOptions extends CommandOptions {
    names?: string[];
    cooldown?: RateLimiter;
    requireClientPerms?: PermissionsString[];
    deferType?: CommandDeferType;
}

export abstract class Command extends SapphireCommand {
    public readonly names: string[];
    public readonly cooldown?: RateLimiter;
    public readonly requireClientPerms: PermissionsString[];
    public readonly deferType: CommandDeferType;
    
    public constructor(context: SapphireCommand.LoaderContext, options: CustomCommandOptions) {
        super(context, {
            ...options,
            generateDashLessAliases: true
        });

        this.names =  (options.names ?? [options.name]).filter((name): name is string => name !== undefined);
        this.requireClientPerms = options.requireClientPerms ?? [];
        this.cooldown = options.cooldown;
        this.deferType = options.deferType ?? CommandDeferType.NONE;
    }

    // Override the chatInputRun to use your custom context
    public abstract chatInputRun(
        interaction: ChatInputCommandInteraction,
        context: CustomChatInputCommandContext
    ): Promise<unknown>;

    // Optional autocomplete method
    public async autocomplete?(
        interaction: AutocompleteInteraction,
        option: AutocompleteFocusedOption
    ): Promise<ApplicationCommandOptionChoiceData[]>;

    // Helper method to convert EventData to CustomChatInputCommandContext
    protected createCustomContext(data: EventData): CustomChatInputCommandContext {
        return {
            commandName: this.name,
            commandId: this.name,
            lang: data.lang,
            langGuild: data.langGuild
        };
    }

    // Helper method to handle your existing execute method signature
    public async execute(interaction: CommandInteraction, data: EventData): Promise<void> {
        if (interaction.isChatInputCommand()) {
            const context = this.createCustomContext(data);
            await this.chatInputRun(interaction, context);
        }
    }
}

// Export the enum as is
export enum CommandDeferType {
    PUBLIC = 'PUBLIC',
    HIDDEN = 'HIDDEN',
    NONE = 'NONE',
}