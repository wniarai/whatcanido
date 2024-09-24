import { FastifyMultipartBaseOptions } from '@fastify/multipart'

export { default } from '@fastify/multipart'

export const autoConfig: FastifyMultipartBaseOptions = {
    limits: {
        fileSize: 1024 * 1024 * 1024 // 1024 MiB, i.e. 1 GiB
    },
}
