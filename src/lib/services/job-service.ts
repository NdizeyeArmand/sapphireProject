import { container } from '@sapphire/framework';
import { scheduleJob, Job } from 'node-schedule';
import type { Client } from 'discord.js';

export class JobService {
    private jobs: Map<string, Job> = new Map();
    private client: Client;

    constructor() {
        this.client = container.client;
    }

    public start(): void {
        this.registerJobs();
    }

    // Register all jobs
    public registerJobs(): void {
        // Example: Update status every 5 minutes
        this.addJob('updateStatus', '*/5 * * * *', async () => {
            await this.updateStatus();
        });

        // Example: Clear old data daily at midnight
        this.addJob('cleanupData', '0 0 * * *', async () => {
            await this.cleanupOldData();
        });

        container.logger.info('All jobs registered successfully');
    }

    // Add a new job
    private addJob(name: string, schedule: string, task: () => Promise<void>): void {
        const job = scheduleJob(schedule, async () => {
            try {
                await task();
                container.logger.debug(`Job ${name} completed successfully`);
            } catch (error) {
                container.logger.error(`Job ${name} failed: ${error}`);
            }
        });

        this.jobs.set(name, job);
        container.logger.info(`Job ${name} registered with schedule: ${schedule}`);
    }

    // Example job: Update bot status
    private async updateStatus(): Promise<void> {
        const guildCount = this.client.guilds.cache.size;
        await this.client.user?.setActivity(`Serving ${guildCount} servers`);
    }

    // Example job: Cleanup old data
    private async cleanupOldData(): Promise<void> {
        // Your cleanup logic here
        container.logger.info('Cleaned up old data');
    }

    // Stop all jobs
    public stopAllJobs(): void {
        for (const [name, job] of this.jobs) {
            job.cancel();
            container.logger.info(`Job ${name} stopped`);
        }
        this.jobs.clear();
    }
}