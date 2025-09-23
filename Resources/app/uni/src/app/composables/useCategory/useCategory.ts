import {ComputedRef, Ref,computed} from "vue";
import useApiContext from "@/app/composables/useApiContext/use-api-context";
import ContextError from "@/app/composables/helpers/ContextError";
import {useContext} from "@/app/composables/useContext/useContext";
import {Schemas} from "@/api-client/api-types/frontApiTypes";

export type UseCategoryReturn = {
  /**
   * Current category entity
   */
  category: ComputedRef<Schemas["Category"]>;
};
/**
 * Composable to get the category from current CMS context
 *
 * @category Product
 * @public
 */
export function useCategory(
  category?: Ref<Schemas["Category"]>,
): UseCategoryReturn {
  const ctx = useApiContext();
  const _category = useContext("category", { context: category });
  if (!_category.value) {
    throw new ContextError("Category");
  }

  return {
    category: computed(() => _category.value),
  };
}
