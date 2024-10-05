import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class MessageCreateListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: 'messageCreate'
        });
    }

    public run(message: Message) {
        if (message.author.bot) return;

        this.container.logger.debug(`Received message: "${message.content}" from ${message.author.tag} in ${message.guild?.name || 'DM'}`);


        if (message.content.startsWith('!')) {
            this.container.logger.debug(`Command detected: ${message.content}`);
        }
    }
}