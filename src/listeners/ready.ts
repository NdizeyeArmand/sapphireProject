import { Listener } from '@sapphire/framework';
import { JobService } from '../lib/services/index.js';

export class ReadyListener extends Listener {
    private jobService: JobService;

    public constructor(context: Listener.LoaderContext) {
        super(context, {
            once: true,
            event: 'ready'
        });
        this.jobService = new JobService();
    }

    public run(): void {
        // Register jobs when bot is ready
        this.jobService.registerJobs();
        this.container.logger.info('Bot is ready and jobs are registered!');
    }
}