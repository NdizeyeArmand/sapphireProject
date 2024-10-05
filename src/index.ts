import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN in environment variables');
    process.exit(1);
  }

const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    loadMessageCommandListeners: true,
  defaultPrefix: '!',
  logger: {
    level: LogLevel.Debug
  }
});


client.login(process.env.DISCORD_TOKEN);