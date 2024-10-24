import { Listener } from '@sapphire/framework';
import { AutocompleteInteraction, ChatInputCommandInteraction, CommandInteraction, NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { Command, CommandDeferType } from '../commands/index.js';
import { DiscordLimits } from '../lib/constants/index.js';
import { EventDataService, Lang, Logger } from '../lib/services/index.js';
import { CommandUtils, InteractionUtils } from '../lib/utils/index.js';
import { EventData } from '../lib/models/internal-models.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class CommandHandler extends Listener {
    private rateLimiter = new RateLimiter(
        Config.rateLimiting.commands.amount,
        Config.rateLimiting.commands.interval * 1000
    );
    private commands: Command[];
    private eventDataService: EventDataService;

    public constructor(context: Listener.LoaderContext, commands: Command[], eventDataService: EventDataService) {
        super(context, {
            event: 'interactionCreate'
        });
        this.commands = commands;
        this.eventDataService = eventDataService;
    }

    public async run(interaction: CommandInteraction | AutocompleteInteraction) {
        // Don't respond to self, or other bots
        if (interaction.user.id === interaction.client.user?.id || interaction.user.bot) {
            return;
        }

        let commandParts =
            interaction instanceof ChatInputCommandInteraction || interaction instanceof AutocompleteInteraction
                ? [
                      interaction.commandName,
                      interaction.options.getSubcommandGroup(false),
                      interaction.options.getSubcommand(false),
                  ].filter((part): part is string => part !== null)
                : [interaction.commandName];
        let commandName = commandParts.join(' ');

        // Try to find the command the user wants
        let command = CommandUtils.findCommand(this.commands, commandParts);
        if (!command) {
            Logger.error(
                Logs.error.commandNotFound
                    .replaceAll('{INTERACTION_ID}', interaction.id)
                    .replaceAll('{COMMAND_NAME}', commandName)
            );
            return;
        }

        if (interaction instanceof AutocompleteInteraction) {
            if (!command.autocomplete) {
                Logger.error(
                    Logs.error.autocompleteNotFound
                        .replaceAll('{INTERACTION_ID}', interaction.id)
                        .replaceAll('{COMMAND_NAME}', commandName)
                );
                return;
            }

            try {
                let option = interaction.options.getFocused(true);
                let choices = await command.autocomplete(interaction, option);
                await InteractionUtils.respond(
                    interaction,
                    choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
                );
            } catch (error) {
                Logger.error(
                    interaction.channel instanceof TextChannel ||
                        interaction.channel instanceof NewsChannel ||
                        interaction.channel instanceof ThreadChannel
                        ? Logs.error.autocompleteGuild
                              .replaceAll('{INTERACTION_ID}', interaction.id)
                              .replaceAll('{OPTION_NAME}', commandName)
                              .replaceAll('{COMMAND_NAME}', commandName)
                              .replaceAll('{USER_TAG}', interaction.user.tag)
                              .replaceAll('{USER_ID}', interaction.user.id)
                              .replaceAll('{CHANNEL_NAME}', interaction.channel.name)
                              .replaceAll('{CHANNEL_ID}', interaction.channel.id)
                              .replaceAll('{GUILD_NAME}', interaction.guild?.name)
                              .replaceAll('{GUILD_ID}', interaction.guild?.id)
                        : Logs.error.autocompleteOther
                              .replaceAll('{INTERACTION_ID}', interaction.id)
                              .replaceAll('{OPTION_NAME}', commandName)
                              .replaceAll('{COMMAND_NAME}', commandName)
                              .replaceAll('{USER_TAG}', interaction.user.tag)
                              .replaceAll('{USER_ID}', interaction.user.id),
                    error
                );
            }
            return;
        }

        // Check if user is rate limited
        let limited = this.rateLimiter.take(interaction.user.id);
        if (limited) {
            return;
        }

        // Defer interaction
        // NOTE: Anything after this point we should be responding to the interaction
        switch (command.deferType) {
            case CommandDeferType.PUBLIC: {
                await InteractionUtils.deferReply(interaction, false);
                break;
            }
            case CommandDeferType.HIDDEN: {
                await InteractionUtils.deferReply(interaction, true);
                break;
            }
        }

        // Return if defer was unsuccessful
        if (command.deferType !== CommandDeferType.NONE && !interaction.deferred) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user: interaction.user,
            channel: interaction.channel ?? undefined,
            guild: interaction.guild ?? undefined,
            args: interaction instanceof ChatInputCommandInteraction ? interaction.options : undefined,
        });

        try {
            // Check if interaction passes command checks
            let passesChecks = await CommandUtils.runChecks(command, interaction, data);
            if (passesChecks) {
                // Execute the command
                await command.execute(interaction, data);
            }
        } catch (error) {
            await this.sendError(interaction, data);

            // Log command error
            Logger.error(
                interaction.channel instanceof TextChannel ||
                    interaction.channel instanceof NewsChannel ||
                    interaction.channel instanceof ThreadChannel
                    ? Logs.error.commandGuild
                          .replaceAll('{INTERACTION_ID}', interaction.id)
                          .replaceAll('{COMMAND_NAME}', commandName)
                          .replaceAll('{USER_TAG}', interaction.user.tag)
                          .replaceAll('{USER_ID}', interaction.user.id)
                          .replaceAll('{CHANNEL_NAME}', interaction.channel.name)
                          .replaceAll('{CHANNEL_ID}', interaction.channel.id)
                          .replaceAll('{GUILD_NAME}', interaction.guild?.name)
                          .replaceAll('{GUILD_ID}', interaction.guild?.id)
                    : Logs.error.commandOther
                          .replaceAll('{INTERACTION_ID}', interaction.id)
                          .replaceAll('{COMMAND_NAME}', commandName)
                          .replaceAll('{USER_TAG}', interaction.user.tag)
                          .replaceAll('{USER_ID}', interaction.user.id),
                error
            );
        }
    }

    private async sendError(interaction: CommandInteraction, data: EventData): Promise<void> {
        try {
            await InteractionUtils.send(
                interaction,
                Lang.getEmbed('errorEmbeds.command', data.lang, {
                    ERROR_CODE: interaction.id,
                    GUILD_ID: interaction.guild?.id ?? Lang.getRef('other.na', data.lang),
                    SHARD_ID: (interaction.guild?.shardId ?? 0).toString(),
                })
            );
        } catch {
            // Ignore
        }
    }
}