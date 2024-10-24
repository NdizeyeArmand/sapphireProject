import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import { InfoOption } from '../../lib/models/enum-helpers/index.js';
import { Language } from '../../lib/models/enum-helpers/index.js';
import { Lang } from '../../lib/services/index.js';

export class InfoCommand extends Command {
    public constructor(context: Command.LoaderContext) {
        super(context, {
            name: 'info',
            description: 'Shows bot information'
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(builder => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('option')
                        .setDescription('Info option to show')
                        .setRequired(true)
                        .addChoices(
                            { name: 'About', value: InfoOption.ABOUT },
                            { name: 'Translate', value: InfoOption.TRANSLATE }
                        )
                )
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const option = interaction.options.getString('option', true) as InfoOption;
        let embed: EmbedBuilder;

        switch (option) {
            case InfoOption.ABOUT: {
                embed = Lang.getEmbed('displayEmbeds.about', Language.Default);
                break;
            }
            case InfoOption.TRANSLATE: {
                embed = Lang.getEmbed('displayEmbeds.translate', Language.Default);
                for (let langCode of Language.Enabled) {
                    embed.addFields([{
                        name: Language.Data[langCode].nativeName,
                        value: Lang.getRef('meta.translators', langCode)
                    }]);
                }
                break;
            }
            default: {
                return;
            }
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}