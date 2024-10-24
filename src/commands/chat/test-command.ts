import { Command } from '@sapphire/framework';
import { Lang } from '../../lib/services/index.js';
import { Language } from '../../lib/models/enum-helpers/index.js';

export class TestCommand extends Command {
    public constructor(context: Command.LoaderContext) {
        super(context, {
            name: 'test',
            description: 'Test command',
            cooldownDelay: 5000
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(builder => 
            builder
                .setName(this.name)
                .setDescription(this.description)
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        await interaction.reply({
            embeds: [Lang.getEmbed('displayEmbeds.test', Language.Default)],
            ephemeral: true
        });
    }
}