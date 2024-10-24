import { Listener } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { Button, ButtonDeferType } from '../interaction-handlers/buttons/button.js';
import { EventDataService } from '../lib/services/index.js';
import { InteractionUtils } from '../lib/utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class ButtonHandler extends Listener {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.buttons.amount,
        Config.rateLimiting.buttons.interval * 1000
    );
    private buttons: Button[];
    private eventDataService: EventDataService;

    public constructor(context: Listener.LoaderContext, buttons: Button[], eventDataService: EventDataService) {
        super(context, {
            event: 'interactionCreate'
        });
        this.buttons = buttons;
        this.eventDataService = eventDataService;
    }

    public async run(interaction: ButtonInteraction) {
        // Don't respond to self, or other bots
        if (interaction.user.id === interaction.client.user?.id || interaction.user.bot) {
            return;
        }

        // Check if user is rate limited
        let limited = this.rateLimiter.take(interaction.user.id);
        if (limited) {
            return;
        }

        // Try to find the button the user wants
        let button = this.findButton(interaction.customId);
        if (!button) {
            return;
        }

        if (button.requireGuild && !interaction.guild) {
            return;
        }

        // Check if the embeds author equals the users tag
        if (
            button.requireEmbedAuthorTag &&
            interaction.message.embeds[0]?.author?.name !== interaction.user.tag
        ) {
            return;
        }

        // Defer interaction
        // NOTE: Anything after this point we should be responding to the interaction
        switch (button.deferType) {
            case ButtonDeferType.REPLY: {
                await InteractionUtils.deferReply(interaction);
                break;
            }
            case ButtonDeferType.UPDATE: {
                await InteractionUtils.deferUpdate(interaction);
                break;
            }
        }

        // Return if defer was unsuccessful
        if (button.deferType !== ButtonDeferType.NONE && !interaction.deferred) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user: interaction.user,
            channel: interaction.channel ?? undefined,
            guild: interaction.guild ?? undefined,
        });

        // Execute the button
        await button.execute(interaction, data);
    }

    private findButton(id: string): Button {
        const button = this.buttons.find(button => button.ids.includes(id));
        if (!button) {
            throw new Error(`Button with id ${id} not found`);
        }
        return button;
    }
}