import { Command } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord.js';
import { DateTime } from 'luxon';
import { Lang } from '../../lib/services/index.js';
import { Language } from '../../lib/models/enum-helpers/index.js';

export class ViewDateSentCommand extends Command {
    public constructor(context: Command.LoaderContext) {
        super(context, {
            name: 'viewdatesent',
            description: 'View when a message was sent',
            cooldownDelay: 5000
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerContextMenuCommand(builder => 
            builder
                .setName('View Date Sent')
                // @ts-expect-error
                .setType(ApplicationCommandType.Message)
        );
    }

    public async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        if (!interaction.isMessageContextMenuCommand()) return;

        await interaction.reply({
            embeds: [Lang.getEmbed('displayEmbeds.viewDateSent', Language.Default, {
                DATE: DateTime.fromJSDate(interaction.targetMessage.createdAt)
                    .toLocaleString(DateTime.DATE_HUGE)
            })],
            ephemeral: true
        });
    }
}

export { ViewDateSentCommand as ViewDateSent };