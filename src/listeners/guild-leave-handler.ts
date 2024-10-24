import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { createRequire } from 'node:module';
import { Logger } from '../lib/services/index.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class GuildLeaveHandler extends Listener {
    public constructor(context: Listener.LoaderContext) {
        super(context, {
            event: 'guildDelete'
        });
    }

    public async run(guild: Guild) {
        Logger.info(
            Logs.info.guildLeft
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );
    }
}