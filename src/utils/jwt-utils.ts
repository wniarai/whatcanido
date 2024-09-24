import {FastifyInstance} from "fastify";

export function generateJWT(fastify: FastifyInstance, payload: object) {
    return fastify.jwt.sign(payload);
}