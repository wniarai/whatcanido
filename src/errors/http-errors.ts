export class DataCenterHttpException<T extends HttpStatusType> extends Error {
    public code: string
    public status: number

    /**
     * @param baseCode 基础错误码，是 HTTP 的一个状态
     * @param dedicatedCode 业务错误码，定义在 `DedicatedCode` 中。必须先定义
     * @param message 可选的消息
     * @param data 可选的数据体
     */
    constructor(
        baseCode: T,
        dedicatedCode?: DedicatedCodeValue<T> | null,
        message?: string,
        public data?: any
    ) {
        super(message)
        this.code = dedicatedCode ? `${baseCode}_${dedicatedCode}` : baseCode
        this.status = HttpStatus[baseCode]
    }
}

export enum HttpStatus {
    // 200 OK
    OK = 200,

    // 4xx Client Error
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRED = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    PROXY_AUTHENTICATION_REQUIRED = 407,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
    LENGTH_REQUIRED = 411,
    PRECONDITION_FAILED = 412,
    PAYLOAD_TOO_LARGE = 413,
    URI_TOO_LONG = 414,
    UNSUPPORTED_MEDIA_TYPE = 415,
    RANGE_NOT_SATISFIABLE = 416,
    EXPECTATION_FAILED = 417,
    IM_A_TEAPOT = 418,
    MISDIRECTED_REQUEST = 421,
    UNPROCESSABLE_ENTITY = 422,
    LOCKED = 423,
    FAILED_DEPENDENCY = 424,
    TOO_EARLY = 425,
    UPGRADE_REQUIRED = 426,
    PRECONDITION_REQUIRED = 428,
    TOO_MANY_REQUESTS = 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE = 431,
    UNAVAILABLE_FOR_LEGAL_REASONS = 451,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
    HTTP_VERSION_NOT_SUPPORTED = 505,
    VARIANT_ALSO_NEGOTIATES = 506,
    INSUFFICIENT_STORAGE = 507,
    LOOP_DETECTED = 508,
    NOT_EXTENDED = 510,
    NETWORK_AUTHENTICATION_REQUIRED = 511
}

// 规定了业务错误码的所有类型
export const DedicatedCode = {
    NOT_FOUND: [
        'USER', //用户不存在
        'FILE'

    ],
    UNAUTHORIZED: [

    ],
    FORBIDDEN: [

    ],
    CONFLICT: [
        'FILE_ALREADY_EXISTS',//文件已存在
        'BAD_FILE_TYPE',//文件类型异常
        'USER',//用户已存在
    ],
    PRECONDITION_FAILED: [
        'FILE_UPLOAD_ERROR', //文件上传异常
        'BAD_AUTHENTICATION',//密码错误
    ],
    INTERNAL_SERVER_ERROR: [
        'BAD_FILE_SAVE', //文件保存失败
        'BAD_FILE_DELETE', //文件删除失败
        'CREATE_USER_FAILED',//用户创建失败

    ]
} as const

export function isDataCenterHttpException(error: unknown): error is DataCenterHttpException<HttpStatusType> {
    return error instanceof DataCenterHttpException;
}

export type DedicatedCodeValue<T extends HttpStatusType> =
    T extends keyof typeof DedicatedCode
        ? (typeof DedicatedCode)[T][number]
        : never

export type HttpStatusType = keyof typeof HttpStatus

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus]
