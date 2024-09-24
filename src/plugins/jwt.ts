import { FastifyInstance } from 'fastify';
import {readFileSync} from 'node:fs'
import path from "node:path";
import fp from 'fastify-plugin';
import console from "console";
import jwt from '@fastify/jwt'

async function jwtPlugin(fastify: FastifyInstance) {
    fastify.register(jwt, {
        secret: {
            private: {
                key: readFileSync(`${path.join(__dirname, '../../static/jwt/certs')}/private.pem`,'utf-8'),
                passphrase: 'super secret passphrase'
            },
            public: readFileSync(`${path.join(__dirname, '../../static/jwt/certs')}/public.pem`,'utf-8')
        },
        sign: {
            algorithm: 'RS512',
            expiresIn: '2h',
        },

    });

    fastify.decorate('authenticate', async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    fastify.addHook('onRequest', async (request, reply) => {
        const publicRoutes = ['/login', '/swagger-ui'];
        const currentPath = await request.routeOptions.url

        if (currentPath != undefined){
            if (!publicRoutes.includes(currentPath)) { // 排除公开路由
                // try {
                //     await request.jwtVerify();
                // } catch (err) {
                //     reply.send(err);
                // }
                console.log("haihaihai")
            }
        }else {
            console.log("ERROR！！")
        }

    });
}

export default fp(jwtPlugin);
