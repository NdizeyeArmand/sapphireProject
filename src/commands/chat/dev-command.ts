import { Args, Command, RegisterBehavior, ChatInputCommand } from '@sapphire/framework';
import { ChatInputCommandInteraction, PermissionsString, Locale } from 'discord.js';
import { createRequire } from 'node:module';
import os from 'node:os';
import typescript from 'typescript';

import { DevCommandName } from '../../lib/models/enum-helpers/index.js';
import { Language } from '../../lib/models/enum-helpers/index.js';
import { EventData } from '../../lib/models/internal-models.js';
import { Lang } from '../../lib/services/index.js';
import { FormatUtils, InteractionUtils, ShardUtils } from '../../lib/utils/index.js';
import { CommandDeferType } from '../index.js';
import { config } from '../../config.js';

// Define the i18n context interface
interface I18nContext {
    lng: Language;
}

const require = createRequire(import.meta.url);
let TsConfig = require('../../../tsconfig.json');

export class DevCommand extends Command {
    public names = [Lang.getRef('chatCommands.dev', Language.Default)];
    public deferType = CommandDeferType.HIDDEN;
    public requireClientPerms: PermissionsString[] = [];

    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: Lang.getRef('chatCommands.dev', Language.Default),
            description: 'Developer command for bot information and management'
        });
    }

    public override async chatInputRun(
        interaction: ChatInputCommandInteraction,
        ctx: ChatInputCommand.RunContext & { i18n?: I18nContext }
    ): Promise<unknown> {
        const eventData: EventData = {
            lang: ctx.i18n?.lng as Locale || Language.Default as Locale,
            langGuild: ctx.i18n?.lng as Locale || Language.Default as Locale
        };

        if (!config.developers.includes(interaction.user.id)) {
            await InteractionUtils.send(
                interaction, 
                Lang.getEmbed('validationEmbeds.devOnly', eventData.lang)
            );
            return;
        }

        return this.handleDevCommand(interaction, eventData);
    }

    private async handleDevCommand(
        interaction: ChatInputCommandInteraction,
        data: EventData
    ): Promise<void> {
        const command = interaction.options.getString(
            Lang.getRef('arguments.command', Language.Default)
        ) as DevCommandName;

        switch (command) {
            case DevCommandName.INFO: {
                const shardCount = this.container.client.shard?.count ?? 1;
                let serverCount: number = 0;

                if (this.container.client.shard) {
                    try {
                        serverCount = await ShardUtils.serverCount(this.container.client.shard);
                    } catch (error) {
                        if (typeof error === 'object' && error !== null && 'name' in error && typeof (error as { name: unknown }).name === 'string') {
                            if ((error as { name: string }).name.includes('ShardingInProcess')) {
                                await InteractionUtils.send(
                                    interaction,
                                    Lang.getEmbed('errorEmbeds.startupInProcess', data.lang)
                                );
                                return;
                            } else {
                                throw error;
                            }
                        }
                    }
                } else {
                    serverCount = this.container.client.guilds.cache.size;
                }

                const memory = process.memoryUsage();

                await InteractionUtils.send(
                    interaction,
                    Lang.getEmbed('displayEmbeds.devInfo', data.lang, {
                        NODE_VERSION: process.version,
                        TS_VERSION: `v${typescript.version}`,
                        ES_VERSION: TsConfig.compilerOptions.target,
                        DJS_VERSION: `v${require('discord.js').version}`,
                        SHARD_COUNT: shardCount.toLocaleString(data.lang),
                        SERVER_COUNT: serverCount.toLocaleString(data.lang),
                        SERVER_COUNT_PER_SHARD: Math.round(serverCount / shardCount).toLocaleString(
                            data.lang
                        ),
                        RSS_SIZE: FormatUtils.fileSize(memory.rss),
                        RSS_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.rss / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HEAP_TOTAL_SIZE: FormatUtils.fileSize(memory.heapTotal),
                        HEAP_TOTAL_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.heapTotal / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HEAP_USED_SIZE: FormatUtils.fileSize(memory.heapUsed),
                        HEAP_USED_SIZE_PER_SERVER:
                            serverCount > 0
                                ? FormatUtils.fileSize(memory.heapUsed / serverCount)
                                : Lang.getRef('other.na', data.lang),
                        HOSTNAME: os.hostname(),
                        SHARD_ID: (interaction.guild?.shardId ?? 0).toString(),
                        SERVER_ID: interaction.guild?.id ?? Lang.getRef('other.na', data.lang),
                        BOT_ID: this.container.client.user?.id ?? 'unknown', // Fix applied here
                        USER_ID: interaction.user.id,
                    })
                );
                break;
            }
            default: {
                return;
            }
        }
    }

    public override registerApplicationCommands(registry: Command.Registry): void {
        registry.registerChatInputCommand(
            (builder) => 
                builder
                    .setName(this.name)
                    .setDescription(this.description)
                    .addStringOption((option) =>
                        option
                            .setName('command')
                            .setDescription('The developer command to execute')
                            .setRequired(true)
                            .addChoices(
                                { name: 'info', value: DevCommandName.INFO }
                            )
                    ),
            {
                behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
                guildIds: config.devGuilds || []
            }
        );
    }
}
