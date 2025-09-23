import type { AnyFn } from '@/app/share/utils'

export type SharedComposableReturn<T extends AnyFn = AnyFn> = T

/**
 * 小程序兼容版 createSharedComposable
 * 功能：跨组件共享状态，多个组件调用返回同一对象
 */
export function createSharedComposable<Fn extends AnyFn>(
  composable: Fn
): SharedComposableReturn<Fn> {
  let state: ReturnType<Fn> | undefined
  return ((...args: any[]) => {
    if (!state) {
      state = composable(...args)
    }
    return state
  }) as SharedComposableReturn<Fn>
}
