import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { TriggerHandler } from './trigger-handler.js';
import { Trigger } from '../lib/triggers/index.js';
import { EventDataService } from '../lib/services/index.js';

export class MessageHandler extends Listener {
    private triggerHandler: TriggerHandler;

    public constructor(context: Listener.LoaderContext, triggers: Trigger[], eventDataService: EventDataService) {
        super(context, {
            event: 'messageCreate'
        });
        this.triggerHandler = new TriggerHandler(context, triggers, eventDataService); // Instantiate TriggerHandler
    }

    public async run(msg: Message) {
        // Don't respond to system messages or self
        if (msg.system || msg.author.id === msg.client.user?.id) {
            return;
        }

        // Process trigger
        await this.triggerHandler.run(msg); // Call the run method instead of process
    }
}