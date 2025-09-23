import type {getCurrentInstance} from 'vue';
/**
 * Void function
 */
export type Fn = () => void

/**
 * Any function
 */
export type AnyFn = (...args: any[]) => any
export type InstanceProxy = NonNullable<NonNullable<ReturnType<typeof getCurrentInstance>>['proxy']>
