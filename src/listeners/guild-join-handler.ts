import { Listener } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { createRequire } from 'node:module';
import { EventDataService, Lang, Logger } from '../lib/services/index.js';
import { ClientUtils, FormatUtils, MessageUtils } from '../lib/utils/index.js';
import { Language } from '../lib/models/enum-helpers/index.js';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class GuildJoinHandler extends Listener {
    private eventDataService: EventDataService;

    public constructor(context: Listener.LoaderContext, eventDataService: EventDataService) {
        super(context, {
            event: 'guildCreate'
        });
        this.eventDataService = eventDataService;
    }

    public async run(guild: Guild) {
        Logger.info(
            Logs.info.guildJoined
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );

        let owner = await guild.fetchOwner();

        // Get data from database
        let data = await this.eventDataService.create({
            user: owner?.user,
            guild,
        });

        // Send welcome message to the server's notify channel
        let notifyChannel = await ClientUtils.findNotifyChannel(guild, data.langGuild);
        if (notifyChannel) {
            const appCommand = await ClientUtils.findAppCommand(
                guild.client,
                Lang.getRef('chatCommands.help', Language.Default)
            );
        
            if (appCommand) {
                await MessageUtils.send(
                    notifyChannel,
                    Lang.getEmbed('displayEmbeds.welcome', data.langGuild, {
                        CMD_LINK_HELP: FormatUtils.commandMention(appCommand),
                    }).setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL() ?? undefined,
                    })
                );
            } else {
                // Handle the case where the app command is not found
                console.error('App command not found');
            }
        }

        // Send welcome message to owner
        if (owner) {
            const appCommand = await ClientUtils.findAppCommand(
                guild.client,
                Lang.getRef('chatCommands.help', Language.Default)
            );

            if (appCommand) {
                await MessageUtils.send(
                    owner.user,
                    Lang.getEmbed('displayEmbeds.welcome', data.lang, {
                        CMD_LINK_HELP: FormatUtils.commandMention(appCommand),
                    }).setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL() ?? undefined,
                    })
                );
            } else {
                // Handle the case where the app command is not found
                console.error('App command not found');
            }
        }
    }
}