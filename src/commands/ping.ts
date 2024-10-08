import { Command } from '@sapphire/framework';
import { Message } from 'discord.js';

export class PingCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: 'ping',
            aliases: ['pong'],
            description: 'Ping bot to see if it is alive',
        });
    }

    public async messageRun(message: Message) {
        this.container.logger.debug(`Ping command triggered by ${message.author.tag} in ${message.guild?.name || 'DM'}`);
        const ms = await message.reply('Ping?');
        const content = `Pong! Bot Latency is ${Math.round(this.container.client.ws.ping)}ms. API Latency is ${ms.createdTimestamp - message.createdTimestamp}ms.`;
        this.container.logger.debug(`Ping command response sent: ${content}`);
        
        return ms.edit(content);
    }
}