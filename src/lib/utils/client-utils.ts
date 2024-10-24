import {
    ApplicationCommand,
    Channel,
    Client,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordApiErrors,
    Guild,
    GuildMember,
    Locale,
    NewsChannel,
    Role,
    StageChannel,
    TextChannel,
    User,
    VoiceChannel,
    Collection,
} from 'discord.js';

import { PermissionUtils, RegexUtils } from './index.js';
import { Lang } from '../services/index.js';

const FETCH_MEMBER_LIMIT = 20;
const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownMember,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.UnknownInteraction,
    DiscordApiErrors.MissingAccess,
];

export class ClientUtils {
    public static async getGuild(client: Client, discordId: string): Promise<Guild | undefined> {
        const id = RegexUtils.discordId(discordId);
        if (!id) {
            return undefined;
        }

        try {
            return await client.guilds.fetch(id);
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

    public static async getChannel(client: Client, discordId: string): Promise<Channel | undefined> {
        const id = RegexUtils.discordId(discordId);
        if (!id) {
            return undefined;
        }

        try {
            const channel = await client.channels.fetch(id);
            return channel ?? undefined;
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

    public static async getUser(client: Client, discordId: string): Promise<User | undefined> {
        const id = RegexUtils.discordId(discordId);
        if (!id) {
            return undefined;
        }

        try {
            return await client.users.fetch(id);
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

    public static async findAppCommand(client: Client, name: string): Promise<ApplicationCommand | undefined> {
        const commands = await client.application?.commands.fetch();
        return commands?.find(command => command.name === name);
    }

    public static async findMember(guild: Guild, input: string): Promise<GuildMember | undefined> {
        try {
            const discordId = RegexUtils.discordId(input);
            if (discordId) {
                return await guild.members.fetch(discordId);
            }

            const tag = RegexUtils.tag(input);
            if (tag) {
                const members = await guild.members.fetch({ 
                    query: tag.username, 
                    limit: FETCH_MEMBER_LIMIT 
                });
                return members.find(member => member.user.discriminator === tag.discriminator);
            }

            const searchResults = await guild.members.fetch({ 
                query: input, 
                limit: 1 
            });
            return searchResults.first();
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

    public static async findRole(guild: Guild, input: string): Promise<Role | undefined> {
        try {
            const discordId = RegexUtils.discordId(input);
            if (discordId) {
                return (await guild.roles.fetch(discordId)) || undefined;
            }

            const search = input.trim().toLowerCase().replace(/^@/, '');
            const roles = await guild.roles.fetch();
            return (
                roles.find(role => role.name.toLowerCase() === search) ??
                roles.find(role => role.name.toLowerCase().includes(search))
            );
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

    public static async findTextChannel(
        guild: Guild,
        input: string
    ): Promise<NewsChannel | TextChannel | undefined> {
        try {
            const discordId = RegexUtils.discordId(input);
            if (discordId) {
                const channel = await guild.channels.fetch(discordId);
                if (channel instanceof NewsChannel || channel instanceof TextChannel) {
                    return channel;
                }
                return undefined;
            }

            const search = input.trim().toLowerCase().replace(/^#/, '').replaceAll(' ', '-');
            const channels = await guild.channels.fetch();
            const textChannels = channels.filter(
                channel => channel instanceof NewsChannel || channel instanceof TextChannel
            );

            return (
                textChannels.find(channel => channel.name.toLowerCase() === search) ??
                textChannels.find(channel => channel.name.toLowerCase().includes(search))
            ) as NewsChannel | TextChannel | undefined;
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

    public static async findVoiceChannel(
        guild: Guild,
        input: string
    ): Promise<VoiceChannel | StageChannel | undefined> {
        try {
            const discordId = RegexUtils.discordId(input);
            if (discordId) {
                const channel = await guild.channels.fetch(discordId);
                if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
                    return channel;
                }
                return undefined;
            }

            const search = input.trim().toLowerCase().replace(/^#/, '');
            const channels = await guild.channels.fetch();
            const voiceChannels = channels.filter(
                channel => channel instanceof VoiceChannel || channel instanceof StageChannel
            );

            return (
                voiceChannels.find(channel => channel.name.toLowerCase() === search) ??
                voiceChannels.find(channel => channel.name.toLowerCase().includes(search))
            ) as VoiceChannel | StageChannel | undefined;
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

    public static async findNotifyChannel(
        guild: Guild,
        langCode: Locale
    ): Promise<TextChannel | NewsChannel | undefined> {
        // Prefer the system channel
        const systemChannel = guild.systemChannel;
        if (systemChannel && PermissionUtils.canSend(systemChannel, true)) {
            return systemChannel;
        }

        // Otherwise look for a bot channel
        const channels = await guild.channels.fetch();
        return channels.find(
            channel =>
                (channel instanceof TextChannel || channel instanceof NewsChannel) &&
                PermissionUtils.canSend(channel, true) &&
                Lang.getRegex('channelRegexes.bot', langCode).test(channel.name)
        ) as TextChannel | NewsChannel | undefined;
    }
}