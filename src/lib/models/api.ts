import express, { Express } from 'express';
import { createRequire } from 'node:module';
import util from 'node:util';

import { Controller } from '../controllers/index.js';
import { checkAuth, handleError } from '../middleware/index.js';
import { Logger } from '../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');
let Logs = require('../../lang/logs.json');

export class Api {
    private app: Express;

    constructor(public controllers: Controller[]) {
        this.app = express();
        this.app.use(express.json());
        this.setupControllers();
        this.app.use(handleError());
    }

    public async start(): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            this.app.listen(Config.api.port, (error?: Error) => {
                if (error) {
                    return reject(error); // Reject if there's an error
                }
                resolve(); // Resolve if successful
            });
        });
        
        Logger.info(Logs.info.apiStarted.replaceAll('{PORT}', Config.api.port));
    }

    private setupControllers(): void {
        for (let controller of this.controllers) {
            if (controller.authToken) {
                controller.router.use(checkAuth(controller.authToken));
            }
            controller.register();
            this.app.use(controller.path, controller.router);
        }
    }
}
