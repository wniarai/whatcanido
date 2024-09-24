/** 是否是开发环境 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/** 是否是生产环境，不仅仅是 `!IS_DEV` */
export const IS_PROD = process.env.NODE_ENV === 'production'

// 简单的重载，极致的享受
/**
 * 开发环境或生产环境，在不同的环境下的值不同
 * @param production P
 * @param development D
 */
export function prodOrDev<T = any>(production: T, development: T): T
/**
 * 以防万一，假设当前的环境变量既不是开发环境也不是生产环境，那么还会有一个 other 的参数
 * @param production P
 * @param development D
 * @param other O
 */
export function prodOrDev<T = any>(production: T, development: T, other: T): T
export function prodOrDev<T = any>(
    production: T,
    development: T,
    other?: T
): T | undefined {
    if (IS_PROD) {
        return production
    } else if (IS_DEV) {
        return development
    }
    return other
}
