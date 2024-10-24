import {
    ApplicationCommandType,
    PermissionFlagsBits,
    PermissionsBitField,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

import { Args } from './index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export class CommandMetadata {
    public static readonly ChatCommands: {
        [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
    } = {
        DEV: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.dev', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.dev'),
            description: Lang.getRef('commandDescs.dev', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.dev'),
            dm_permission: true,
            default_member_permissions: PermissionsBitField.resolve([
                PermissionFlagsBits.Administrator,
            ]).toString(),
            options: [
                {
                    ...Args.DEV_COMMAND,
                    required: true,
                },
            ],
        },
        HELP: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.help', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.help'),
            description: Lang.getRef('commandDescs.help', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.help'),
            dm_permission: true,
            default_member_permissions: undefined,
            options: [
                {
                    ...Args.HELP_OPTION,
                    required: true,
                },
            ],
        },
        INFO: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.info', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.info'),
            description: Lang.getRef('commandDescs.info', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.info'),
            dm_permission: true,
            default_member_permissions: undefined,
            options: [
                {
                    ...Args.INFO_OPTION,
                    required: true,
                },
            ],
        },
        TEST: {
            type: ApplicationCommandType.ChatInput,
            name: Lang.getRef('chatCommands.test', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('chatCommands.test'),
            description: Lang.getRef('commandDescs.test', Language.Default),
            description_localizations: Lang.getRefLocalizationMap('commandDescs.test'),
            dm_permission: true,
            default_member_permissions: undefined,
        },
    };

    public static readonly MessageCommands: {
        [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
    } = {
        VIEW_DATE_SENT: {
            type: ApplicationCommandType.Message,
            name: Lang.getRef('messageCommands.viewDateSent', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('messageCommands.viewDateSent'),
            default_member_permissions: undefined,
            dm_permission: true,
        },
    };

    public static readonly UserCommands: {
        [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
    } = {
        VIEW_DATE_JOINED: {
            type: ApplicationCommandType.User,
            name: Lang.getRef('userCommands.viewDateJoined', Language.Default),
            name_localizations: Lang.getRefLocalizationMap('userCommands.viewDateJoined'),
            default_member_permissions: undefined,
            dm_permission: true,
        },
    };

    // Helper method to get all commands
    public static getAllCommands(): (RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody)[] {
        return [
            ...Object.values(this.ChatCommands),
            ...Object.values(this.MessageCommands),
            ...Object.values(this.UserCommands)
        ];
    }

    // Prevent instantiation
    private constructor() {
        // This is a static class
    }
}