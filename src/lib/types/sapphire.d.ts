import { ClientUtils } from '../utils/client-utils.js';

declare module '@sapphire/pieces' {
    interface Container {
        utils: {
            client: typeof ClientUtils;
        };
    }
}