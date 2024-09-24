
import {uploadFile, getFileExtension, deleteFile, transferFile} from "../../services/fileService";
import {Result} from "../../common/results";
import * as console from "console";
import {FastifyPluginAsyncJsonSchemaToTs} from "@fastify/type-provider-json-schema-to-ts";
import {isDataCenterHttpException} from "@/errors/http-errors";


export const file: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {

    /**
     *上传文件，仅支持HTML
     */
    fastify.post(
        '',
        {
            schema: {
                tags: ['file'],
                summary: '上传文件',
                consumes: ['multipart/form-data'],
                querystring: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        db_type: {
                            type: 'string',
                            enum: ['g100', 'e100', 'pg', 'og', 'panwei']
                        }
                    },
                    required: ['user_id', 'db_type']
                },
            } as const
        },
        async (request, reply) => {
            try {
                const { user_id, db_type } = request.query;
                const file = await request.file();

                if (file) {
                    const extension = await getFileExtension(file.filename);
                    if (extension !== 'html') {
                        return reply.status(412).send(Result.fail(412, '仅支持HTML文件上传'));
                    }
                    if (await uploadFile(file, user_id, db_type)){
                        return reply.send(Result.success());
                    }
                } else {
                    return reply.status(412).send(Result.fail(412, '未提供文件'));
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
    );


    fastify.delete(
        '/:id',
        {
            schema: {
                tags: ['file'],
                summary: '删除文件',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' }
                    },
                    required: ['id']
                } as const
            }
        },
        async (request, reply) => {
            try{
                const { id } = request.params
                if(await deleteFile(id)){
                    return reply.send(Result.success())
                }else{
                    return reply.status(500).send(Result.fail(500))
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
    );


    fastify.post(
        '/:id',
        {
            schema: {
                tags: ['file'],
                summary: '转换文件2html',
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id']
                },
            } as const
        },
        async (request, reply) => {
            try {
                const { id } = request.params
                const fileInfo = await transferFile(id)

            } catch (error) {
                if (isDataCenterHttpException(error)) {
                    return reply.status(error.status).send(Result.fail(error.status, error.message));
                } else {
                    console.error(error)
                    return reply.status(500).send(Result.fail(500, 'unknown error'));
                }
            }
        }
    );



}



export default file

export const autoConfig = {
    prefix: '/v1/files'
}
