import {DataCenterHttpException} from './http-errors'


export class FileAlreadyExistsException extends DataCenterHttpException<'CONFLICT'> {
    constructor(file_name: string, user_id : string) {
            super('CONFLICT', 'FILE_ALREADY_EXISTS', `目标文件 (filename: ${file_name}) 在${user_id} 目录中已存在`)
    }
}

export class FileUploadException extends DataCenterHttpException<'PRECONDITION_FAILED'> {
    constructor() {
        super('PRECONDITION_FAILED', 'FILE_UPLOAD_ERROR', `文件上传异常`)
    }
}

export class FileSaveException extends DataCenterHttpException<'INTERNAL_SERVER_ERROR'> {
    constructor(file_name: string) {
        super('INTERNAL_SERVER_ERROR', 'BAD_FILE_SAVE', `目标文件 (filename: ${file_name}) 保存失败`)
    }
}

export class FileDeleteException extends DataCenterHttpException<'INTERNAL_SERVER_ERROR'> {
    constructor(file_name: string) {
        super('INTERNAL_SERVER_ERROR', 'BAD_FILE_DELETE', `目标文件 (filename: ${file_name}) 删除失败`)
    }
}

export class FileNotFoundException extends DataCenterHttpException<'NOT_FOUND'> {
    constructor(value: string,type: 'id'|'filename' = 'id') {
        if ( type === 'id'){
            super('NOT_FOUND', 'FILE', `文件ID: ${value} 不存在 `)
        }else{
            super('NOT_FOUND', 'FILE', `文件: ${value} 不存在 `)
        }
    }
}



export class FileTypeUnspoortException extends DataCenterHttpException<'CONFLICT'> {
    constructor(type: string) {
        super('CONFLICT', 'BAD_FILE_TYPE', `文件类型为 ${type} 不支持的类型 `)
    }
}