import { Listener } from '@sapphire/framework';
import { Client } from 'discord.js';

export class ReadyListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: 'ready'
        });
    }

    public run(client: Client) {
        const { username, id } = client.user!;
        this.container.logger.info(`Successfully logged in as ${username} (${id})`);

        const commands = [...this.container.stores.get('commands').values()];
        this.container.logger.info(`Loaded commands: ${commands.map(c => c.name).join(', ')}`);

        this.container.logger.info(`Bot is listening for prefix: ${this.container.client.options.defaultPrefix}`);

        this.container.logger.info(`Bot is in ${client.guilds.cache.size} servers`);
    }
}