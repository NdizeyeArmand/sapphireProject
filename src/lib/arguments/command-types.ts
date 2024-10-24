import { ChatInputCommandContext } from '@sapphire/framework';

export interface CustomChatInputCommandContext extends ChatInputCommandContext {
    lang: string;
    langGuild: string;
}

export class CustomCommand {
    public context: CustomChatInputCommandContext;

    constructor(context: CustomChatInputCommandContext) {
        this.context = context;
    }

    public execute(): void {
        // Your command execution logic here
        console.log(`Executing command with lang: ${this.context.lang} and langGuild: ${this.context.langGuild}`);
    }
}