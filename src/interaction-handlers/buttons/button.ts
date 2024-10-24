import { InteractionHandler, InteractionHandlerTypes, Option } from '@sapphire/framework';
import { EventData } from '../../lib/models/internal-models.js';
import { ButtonInteraction, type Interaction } from 'discord.js';
import type { Awaitable } from '@sapphire/utilities';

interface ParsedData {
    action: string;
    userId?: string;
}

export enum ButtonDeferType {
    REPLY = 'REPLY',
    UPDATE = 'UPDATE',
    NONE = 'NONE',
}

export interface Button {
    ids: string[];
    deferType: ButtonDeferType;
    requireGuild: boolean;
    requireEmbedAuthorTag: boolean;
    execute(intr: ButtonInteraction, data: EventData): Promise<void>;
}

export class ButtonHandler extends InteractionHandler {
    public constructor(context: InteractionHandler.Context, options: InteractionHandler.Options) {
        super(context, {
            ...options,
            name: 'buttonHandler',
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public override parse(interaction: Interaction): Awaitable<Option<ParsedData>> {
        // First check if this is a button interaction
        if (!interaction.isButton()) return this.none();

        const [namespace, action, userId] = interaction.customId.split(':');

        if (namespace !== 'your-namespace') return this.none();
        
        return this.some({ action, userId });
    }

    public override async run(interaction: ButtonInteraction, data: ParsedData): Promise<void> {
        try {
            switch (data.action) {
                case 'profile':
                    await interaction.reply(`Showing profile for ${data.userId}`);
                    break;
                default:
                    await interaction.reply({ 
                        content: 'Unknown action', 
                        ephemeral: true 
                    });
            }
        } catch (error) {
            this.container.logger.error('Error in button handler:', error);
            await interaction.reply({ 
                content: 'An error occurred while processing your request.', 
                ephemeral: true 
            }).catch(() => null);
        }
    }
}