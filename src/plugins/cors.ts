import { FastifyCorsOptions, FastifyCorsOptionsDelegate } from '@fastify/cors';

export { default } from '@fastify/cors';

export const autoConfig = (): FastifyCorsOptions | FastifyCorsOptionsDelegate => ({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD'],
    credentials: true
});
