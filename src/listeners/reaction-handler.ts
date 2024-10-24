import { Listener } from '@sapphire/framework';
import type { Message, MessageReaction, User } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { Reaction } from '../lib/reactions/index.js';
import { EventDataService } from '../lib/services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class ReactionHandler extends Listener {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.reactions.amount,
        Config.rateLimiting.reactions.interval * 1000
    );
    private reactions: Reaction[];
    private eventDataService: EventDataService;

    public constructor(context: Listener.LoaderContext, reactions: Reaction[], eventDataService: EventDataService) {
        super(context, {
            event: 'messageReactionAdd'
        });
        this.reactions = reactions;
        this.eventDataService = eventDataService;
    }

    public async run(msgReaction: MessageReaction, user: User) {
        // Don't respond to self, or other bots
        if (user.id === msgReaction.client.user?.id || user.bot) {
            return;
        }

        // Check if user is rate limited
        let limited = this.rateLimiter.take(user.id);
        if (limited) {
            return;
        }

        // Try to find the reaction the user wants
        let reaction = msgReaction.emoji.name ? this.findReaction(msgReaction.emoji.name) : null;
        if (!reaction) {
            return;
        }

        if (reaction.requireGuild && !msgReaction.message.guild) {
            return;
        }

        if (reaction.requireSentByClient && msgReaction.message.author?.id !== msgReaction.client.user?.id) {
            return;
        }

        // Check if the embeds author equals the reactors tag
        if (reaction.requireEmbedAuthorTag && msgReaction.message.embeds[0]?.author?.name !== user.tag) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user,
            channel: msgReaction.message.channel,
            guild: msgReaction.message.guild ?? undefined,
        });

        // Ensure the message is fully fetched if it's a partial
        if (msgReaction.message.partial) {
            await msgReaction.message.fetch();
        }

        // Execute the reaction
        await reaction.execute(msgReaction, msgReaction.message as Message, user, data);
    }

    private findReaction(emoji: string): Reaction {
        const reaction = this.reactions.find(reaction => reaction.emoji === emoji);
        if (!reaction) {
            throw new Error(`Reaction with emoji ${emoji} not found`);
        }
        return reaction;
    }
}