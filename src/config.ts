import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
    DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
    CLIENT_ID: z.string().min(1, 'Client ID is required'),
    DEVELOPER_ID: z.string().min(1, 'Developer ID is required'),
    DEV_GUILD_IDS: z.array(z.string()).optional(),
});

type Env = z.infer<typeof envSchema>;

const env: Env = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
    CLIENT_ID: process.env.CLIENT_ID!,
    DEVELOPER_ID: process.env.DEVELOPER_ID!,
    DEV_GUILD_IDS: process.env.DEV_GUILD_IDS?.split(',')
};

export const config = {
    client: {
        id: env.CLIENT_ID,
        token: env.DISCORD_TOKEN,
    },
    developers: env.DEVELOPER_ID,
    devGuilds: env.DEV_GUILD_IDS,
} as const;

export type BotConfig = typeof config;