import '@sapphire/plugin-logger/register';
import { container } from '@sapphire/framework';
import { BotClient } from './BotClient.js';
import { config } from './config.js';
import { ClientUtils } from './lib/utils/client-utils.js';

// Initialize the client
const client = new BotClient();

// Inject utilities into the container
container.utils = {
    client: ClientUtils,
} as const;

// Register event handlers
client.once('ready', async () => {
    // Initialize commands
    if (!client.application?.owner) await client.application?.fetch();
    
    // Set up slash commands
    const commands = await client.application?.commands.set([
        // Add your slash commands here
    ]);
    
    client.logger.info('Bot is ready!');
    client.logger.info(`Loaded ${commands?.size ?? 0} application commands`);
});

// Handle errors
client.on('error', (error) => {
    client.logger.error(error);
});

// Start the bot
try {
    await client.login(config.client.token);
} catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
}

// Handle process termination
process.on('SIGINT', async () => {
    client.logger.info('Received SIGINT signal, shutting down...');
    await client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    client.logger.error('Unhandled promise rejection:', error);
});