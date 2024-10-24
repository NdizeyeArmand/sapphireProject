import '@sapphire/plugin-logger/register';
import { ApplicationCommandRegistries, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';

// Set default behavior for command registration
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

// Enable colorette
colorette.createColors({ useColor: true });