import {  createUser, login, findOneById,updatePassword } from '../../services/userService'
import {UserData} from "../../common/interfaces";
import {Result} from "../../common/results";
import * as console from "console";
import { generateJWT } from '../../utils/jwt-utils'
import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts'
import {isDataCenterHttpException} from "@/errors/http-errors";


export const user: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {

    fastify.post(
        '/v1/session',
        {
            schema: {
                tags: ['user'],
                summary: '登陆',
                body: {
                    type: 'object',
                    properties: {
                        account: { type: 'string' },
                        password: { type: 'string' },
                        id: {type: 'string'}
                    },
                    required: ['account', 'password']
                } as const
            }
        },
        async function (request, reply) {
            const userData = request.body as UserData

            if (userData.account === '') {
                return Result.fail(500, '账号为空')
            } else {
                if (userData.password === '') {
                    return Result.fail(500, '密码为空')
                } else {
                    try {
                        const stat = await login(userData)
                        if (stat !== undefined) {
                            if (stat.code === 1){
                                // 权限设置
                                const auth = stat.data.account == 'admin' ? 1 : 0
                                // 生成token
                                const token = generateJWT(fastify,{
                                    account: stat.data.account,
                                    id: stat.data.id,
                                    auth: auth
                                })
                                // 不返回密码
                                stat.data.password = ''
                                console.log(stat.data)
                                return Result.success('登陆成功', {
                                    userData:stat.data,
                                    token:token
                                })
                            }else if (stat.code === 0){
                                return Result.fail(500, stat.msg)
                            }
                        } else {
                            return Result.fail(500, '其他错误')
                        }
                    } catch (error) {
                        if (isDataCenterHttpException(error)) {
                            return reply.status(error.status).send(Result.fail(error.status, error.message));
                        } else {
                            console.error(error)
                            return reply.status(500).send(Result.fail(500, 'unknown error'));
                        }
                    }
                }
            }
        }
    )



    fastify.post(
        '/v1/users',
        {
            schema: {
                tags: ['user'],
                summary: '注册',
                body: {
                    type: 'object',
                    properties: {
                        account: { type: 'string' },
                        password: { type: 'string' },
                    },
                    required: ['account', 'password']
                } as const
            }
        },
        async function (request, reply) {
            try {
                const data = {
                    account : request.body.account,
                    password: request.body.password
                } as UserData

                if (await createUser(data)) {
                    return Result.success()
                } else {
                    return Result.fail(500)
                }
            }catch (error){
                if (isDataCenterHttpException(error)) {
                    return reply.status(error.status).send(Result.fail(error.status, error.message));
                } else {
                    console.error(error)
                    return reply.status(500).send(Result.fail(500, 'unknown error'));
                }
            }
        }
    )

    fastify.get(
        '/v1/users/:id',
        {
            schema: {
                tags: ['user'],
                summary: '通过ID查找',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' }
                    },
                    required: ['id']
                } as const
            }
        },
        async function (request, reply) {
            try {
                const { id } = request.params
                const userData = await findOneById(id)

                if(userData != null){
                    return Result.success(userData)
                }else {
                    return Result.fail(404)
                }
            }catch (error){
                if (isDataCenterHttpException(error)) {
                    return reply.status(error.status).send(Result.fail(error.status, error.message));
                } else {
                    console.error(error)
                    return reply.status(500).send(Result.fail(500, 'unknown error'));
                }
            }
        }
    )

    fastify.patch(
        '/v1/users/:id',
        {
            schema: {
                tags: ['user'],
                summary: '修改密码',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' }
                    },
                    required: ['id']
                },
                body: {
                    type: 'object',
                    properties: {
                        new_password: { type: 'string' },
                        old_password: { type: 'string' },
                    },
                    required: ['new_password', 'old_password']
                }
            }
        },
        async function (request, reply) {
            const { id } = request.params;
            try {
                const { new_password, old_password } = request.body;
                const sb = await updatePassword({
                    id:id,
                    old_password:old_password,
                    new_password:new_password
                });
                reply.send({ message: 'Password updated successfully' });
            } catch (error) {
                console.error('Error updating password:', error);
                reply.status(500).send({ error: 'Internal Server Error' });
            }
        }
    );


}

export default user

// export const autoConfig = {
//     prefix: '/v1/users'
// }
