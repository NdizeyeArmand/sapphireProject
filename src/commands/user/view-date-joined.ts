import { Command } from '@sapphire/framework';

export class ViewDateJoinedCommand extends Command {
    public constructor(context: Command.LoaderContext) {
        super(context, {
            name: 'joined',
            description: 'Shows when a user joined the server'
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to check join date for')
                        .setRequired(false)
                )
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user') ?? interaction.user;
        const member = await interaction.guild?.members.fetch(targetUser.id);
        const joinedAt = member?.joinedAt?.toLocaleDateString() ?? 'Unknown';
        
        await interaction.reply(`${targetUser.tag} joined on ${joinedAt}`);
    }
}