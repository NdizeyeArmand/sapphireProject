import { Command } from '@sapphire/framework';

export class HelpCommand extends Command {
    public constructor(context: Command.LoaderContext) {
        super(context, {
            name: 'help',
            description: 'Shows help information'
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(builder => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Command category to show')
                        .setRequired(false)
                )
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const commands = this.container.stores.get('commands');
        const commandList = [...commands.values()]
            .map(cmd => `/${cmd.name} - ${cmd.description}`)
            .join('\n');
        
        await interaction.reply({
            content: `Available commands:\n${commandList}`,
            ephemeral: true
        });
    }
}