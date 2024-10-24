import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';
import { config } from '../config.js';

export class DeveloperOnlyPrecondition extends Precondition {
    public override async chatInputRun(interaction: ChatInputCommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
        return this.checkDeveloper(interaction.user.id);
    }

    public override async messageRun(message: Message) {
        return this.checkDeveloper(message.author.id);
    }

    private checkDeveloper(userId: string) {
        return config.developers === userId
            ? this.ok()
            : this.error({ message: 'This command can only be used by developers.' });
    }
}

declare module '@sapphire/framework' {
    interface Preconditions {
        DeveloperOnly: never;
    }
}