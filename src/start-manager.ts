import { ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();
const require = createRequire(import.meta.url);

class SapphireShardingManager {
    private manager: ShardingManager;

    constructor() {
        this.manager = new ShardingManager('./dist/index.js', {
            token: process.env.DISCORD_TOKEN,
            mode: 'process',
            respawn: true,
            totalShards: 'auto'
        });

        this.manager.on('shardCreate', shard => {
            console.log(`Launched shard ${shard.id}`);
        });
    }

    async start() {
        try {
            console.log('Starting shards...');
            await this.manager.spawn();
            console.log('All shards spawned successfully');
        } catch (error) {
            console.error('Error spawning shards:', error);
            process.exit(1);
        }
    }
}

const shardManager = new SapphireShardingManager();
shardManager.start();