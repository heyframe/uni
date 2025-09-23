import type { MaybeRef, Ref } from 'vue'
import { shallowReadonly, shallowRef, unref } from 'vue'

export interface UseCounterOptions {
  min?: number
  max?: number
}

export interface UseCounterReturn {
  readonly count: Readonly<Ref<number>>
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  get: () => number
  set: (val: number) => void
  reset: (val?: number) => number
}

export function useCounter(initialValue: MaybeRef<number> = 0, options: UseCounterOptions = {}): UseCounterReturn {
  let _initialValue = unref(initialValue)
  const count = shallowRef<number>(_initialValue)

  const {
    max = Number.POSITIVE_INFINITY,
    min = Number.NEGATIVE_INFINITY,
  } = options

  const inc = (delta = 1) => count.value = Math.max(Math.min(max, count.value + delta), min)
  const dec = (delta = 1) => count.value = Math.min(Math.max(min, count.value - delta), max)
  const get = () => count.value
  const set = (val: number) => (count.value = Math.max(min, Math.min(max, val)))
  const reset = (val = _initialValue) => {
    _initialValue = val
    return set(val)
  }

  return { count: shallowReadonly(count), inc, dec, get, set, reset }
}
