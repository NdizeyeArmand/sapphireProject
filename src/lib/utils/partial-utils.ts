import {
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordApiErrors,
    Message,
    MessageReaction,
    PartialMessage,
    PartialMessageReaction,
    PartialUser,
    User,
} from 'discord.js';

const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.MissingAccess,
];

export class PartialUtils {
    public static async fillUser(user: User | PartialUser): Promise<User | undefined> {
        if (user.partial) {
            try {
                return await user.fetch();
            } catch (error) {
                if (
                    error instanceof DiscordAPIError &&
                    typeof error.code === 'number' &&
                    IGNORED_ERRORS.includes(error.code)
                ) {
                    return undefined;
                }
                throw error;
            }
        }

        return user as User;
    }

    public static async fillMessage(msg: Message | PartialMessage): Promise<Message | undefined> {
        if (msg.partial) {
            try {
                return await msg.fetch();
            } catch (error) {
                if (
                    error instanceof DiscordAPIError &&
                    typeof error.code === 'number' &&
                    IGNORED_ERRORS.includes(error.code)
                ) {
                    return undefined;
                }
                throw error;
            }
        }

        return msg as Message;
    }

    public static async fillReaction(
        msgReaction: MessageReaction | PartialMessageReaction
    ): Promise<MessageReaction | undefined> {
        let filledReaction: MessageReaction | PartialMessageReaction = msgReaction;

        if (msgReaction.partial) {
            try {
                filledReaction = await msgReaction.fetch();
            } catch (error) {
                if (
                    error instanceof DiscordAPIError &&
                    typeof error.code === 'number' &&
                    IGNORED_ERRORS.includes(error.code)
                ) {
                    return undefined;
                }
                throw error;
            }
        }

        const filledMessage = await this.fillMessage(filledReaction.message);
        if (!filledMessage) {
            return undefined;
        }

        return {
            ...filledReaction,
            message: filledMessage,
        } as MessageReaction;
    }
}