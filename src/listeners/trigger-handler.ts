import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { EventDataService } from '../lib/services/index.js';
import { Trigger } from '../lib/triggers/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class TriggerHandler extends Listener {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.triggers.amount,
        Config.rateLimiting.triggers.interval * 1000
    );
    private triggers: Trigger[];
    private eventDataService: EventDataService;

    public constructor(context: Listener.LoaderContext, triggers: Trigger[], eventDataService: EventDataService) {
        super(context, {
            event: 'messageCreate'
        });
        this.triggers = triggers;
        this.eventDataService = eventDataService;
    }

    public async run(msg: Message) {
        // Check if user is rate limited
        let limited = this.rateLimiter.take(msg.author.id);
        if (limited) {
            return;
        }

        // Find triggers caused by this message
        let triggers = this.triggers.filter(trigger => {
            if (trigger.requireGuild && !msg.guild) {
                return false;
            }

            if (!trigger.triggered(msg)) {
                return false;
            }

            return true;
        });

        // If this message causes no triggers then return
        if (triggers.length === 0) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user: msg.author,
            channel: msg.channel,
            guild: msg.guild ?? undefined,
        });

        // Execute triggers
        for (let trigger of triggers) {
            await trigger.execute(msg, data);
        }
    }
}