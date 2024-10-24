import { CommandMetadata } from '../lib/arguments/metadata.js';

export { Command, CommandDeferType } from './command.js';
export { CustomChatInputCommandContext as CommandTypesCustomChatInputCommandContext } from '../lib/arguments/command-types.js';
export * from '../preconditions/index.js';
export * from './command.js';

export { CommandMetadata }
export const ChatCommandMetadata = CommandMetadata.ChatCommands;
export const MessageCommandMetadata = CommandMetadata.MessageCommands;
export const UserCommandMetadata = CommandMetadata.UserCommands;