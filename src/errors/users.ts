import {DataCenterHttpException} from './http-errors'
import {FileAlreadyExistsException} from "@/errors/files";


export class UserNotFoundException extends DataCenterHttpException<'NOT_FOUND'> {
    constructor(id: number | string, type: 'id' | 'account' = 'id') {
        if (type === 'id') {
            super('NOT_FOUND', 'USER', `目标用户 (ID: ${id}) 不存在`)
        } else {
            super('NOT_FOUND', 'USER', `目标用户 (Account: ${id}) 不存在`)
        }
    }
}

export class UserAlreadyExistsException extends DataCenterHttpException<'CONFLICT'> {
    constructor(account: string) {
        super('CONFLICT', 'USER', `目标用户 (Account: ${account}) 已存在`)
    }
}

export class UserPasswordException extends DataCenterHttpException<'PRECONDITION_FAILED'> {
    constructor(account: string) {
        super('PRECONDITION_FAILED', 'BAD_AUTHENTICATION', `目标用户 (Account: ${account}) 密码错误`)
    }
}

// export class CreateUserException extends DataCenterHttpException<'INTERNAL_SERVER_ERROR'> {
//     constructor(msg: string) {
//         super('INTERNAL_SERVER_ERROR', 'CREATE_USER_FAILED', `用户创建失败:${msg}`)
//     }
// }