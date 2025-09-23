import {ref, Ref} from "vue";
import { injectLocal } from '@/app/share/injectLocal'
import { provideLocal } from '@/app/share/provideLocal'
import { computed, unref } from "vue";

export function useContext<T>(
  injectionName: string,
  params?: {
    context?: Ref<T> | T;
    replace?: T;
  },
) {
  const isNewContext = !!params?.context;

  const _context: Ref<T> = isNewContext
    ? (ref(unref(params?.context)) as Ref<T>)
    : (injectLocal(injectionName, ref()) as Ref<T>);
  provideLocal(injectionName, _context);

  /**
   * Used for global context to replace it with new Value. Used mainly for session context
   */
  if (params?.replace) {
    _context.value = unref(params.replace);
  }

  return _context;
}
