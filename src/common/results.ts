export interface ResultOptions<T = any> {
    /** 状态码，默认为 200 */
    code?: number

    /** 消息，默认为 null */
    message?: string

    /** 数据体，默认为 null */
    data?: T
}

/**
 * 通用的 JSON 返回格式
 */
export class Result<T = any> {
    code: number
    message: string | null
    data: T

    /**
     * 无参数初始化，默认为 200 成功
     */
    constructor()

    /**
     * 通过对象初始化
     * @param options options
     */
    constructor(options: ResultOptions<T>)

    /**
     * 通过 code 初始化
     * @param options options
     */
    constructor(code: number)

    /**
     * 通过 code 和 message 初始化，不提供数据体
     * @param code code
     * @param message message
     */
    constructor(code: number, message: string | null)

    /**
     * 完整的不分页数据，三个字段都有
     * @param code code
     * @param message message
     * @param data data
     */
    constructor(code: number, message: string | null, data: T)

    constructor(
        arg1?: number | ResultOptions<T>,
        message?: string | null,
        data?: T
    ) {
        if (!arguments.length) {
            return
        }

        if (typeof arg1 === 'object') {
            const { code = 200, message = null, data = null } = arg1
            this.code = code
            this.message = message
            this.data = data as T
        } else if (typeof arg1 === 'number') {
            this.code = arg1!
            this.message = message ?? null
            this.data = (data ?? null) as T
        }
    }

    /**
     * 获取一个 Result 对象
     */
    static success(): Result<null>
    static success<T>(data: T): Result<T>
    static success<T>(message: string | null, data: T): Result<T>
    static success(arg1?: any, arg2?: any): Result {
        if (arguments.length === 1) {
            return new Result(200, null, arg1)
        }
        return new Result(200, arg1, arg2)
    }

    /**
     * 获取一个 Result 失败的对象
     */
    static fail(code: number): Result<null>
    static fail(code: number, message: string): Result<null>
    static fail<T>(code: number, message: string, data: T): Result<T>
    static fail<T>(code: number, message?: string, data?: T): Result<T> {
        return new Result(code, message ?? null, data ?? (null as T))
    }
}

// 直接创建，默认是一个 200，message 和 data 都为空的对象
const r1 = new Result()

// 直接创建的对象，也可以赋值
const r2 = new Result()
r2.code = 404
r2.message = '对象未找到'

// 可以分别传入 1 ~ 3 个参数，分别对应 code, message 和 data
const r3 = new Result(402)
const r4 = new Result(400, '数据格式不合法')
const r5 = new Result(409, '对象被占用', { reason: '当前操作正在进行中，暂不可更改' })

// 可以直接传入一个初始化对象，可以选择性地包括 code, message 或 data 字段
const r6 = new Result({
    code: 500,
    message: '内部错误'
})

// 可以使用静态方法，不用 new
// success 默认的 code 都是 200
const r7 = Result.success()

// 提供一个参数时，Result.success 是提供 data 字段
const r8 = Result.success({
    name: '这是数据体'
})

// 提供两个参数时，Result.success 分别是 message 和 data 字段
const r9 = Result.success('接口调用成功', {
    name: '这是数据体'
})

// 注：没有这种使用方法，因为第一个字段是 data 字段。实际上的结果是
// { code: 200, message: null, data: '成功调用' }
const r81 = Result.success('成功调用')

// 如果需要一个只有 message 字段的 Result，应该手动指明 data 字段为空。这样设计的考虑是 success 通常具备数据体
const r82 = Result.success('成功调用', null)

// 当然，也有 fail 静态方法。fail 方法必须指定错误码
const r10 = Result.fail(503)

// 两个参数
const r11 = Result.fail(401, '当前未登录')

// 三个参数
const r12 = Result.fail(503, '服务当前不可用', { reason: '上游服务不可用' })

// 附加 1
// Result 具备类型推断，如 r12，其类型被推断为：Result<{ reason: string; }>
// 所以 tt 的类型是 string，
const stringType = r12.data.reason

// 你或许需要这样来保证 data 的类型为 any
// 不过考虑到 Result 都是一次性的，很少有数据变更的情况。
const anyTypeResult = Result.success<any>({ any: '类型是任意的' })
anyTypeResult.data = 1
anyTypeResult.data = null
