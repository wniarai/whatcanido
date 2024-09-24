import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
    await fastify.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: '接口测试',
                description: 'API测试',
                version: '0.0.1'
            },
            tags: [
                { name: 'user', description: '用户相关的操作' },
                { name: 'file', description: '文件相关' }
            ],
        },

    })
    await fastify.register(fastifySwaggerUI, {
        routePrefix: '/swagger-ui'
    })
})
