import {useHeyFrameContext} from "@/app/composables/useHeyFrameContext/useHeyFrameContext";
import {useCategory} from "@/app/composables/useCategory/useCategory";
import type {Ref} from "vue";
import {inject, provide, ref, computed} from "vue";
import {createInjectionState} from "@/app/share/createInjectionState";
import {createSharedComposable} from "@/app/share/createSharedComposable";
import type {operations, Schemas} from "@/api-client/api-types/frontApiTypes";

function isObject<T>(item: T): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

function merge<T extends { [key in keyof T]: unknown }>(
  target: T,
  ...sources: T[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source === undefined) {
    return target;
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        merge(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return merge(target, ...sources);
}

export type ListingType = "productSearchListing" | "categoryListing";

export type ShortcutFilterParam<
  T extends keyof Schemas["ProductListingCriteria"] = keyof Schemas["ProductListingCriteria"],
> = {
  code: T;
  value: Schemas["ProductListingCriteria"][T];
};
export type UseListingReturn = {}

/**
 * @public
 * @category Product
 */
export function useListing(params?: {
  listingType: ListingType;
  categoryId?: string;
  defaultSearchCriteria?: operations["searchPage post /search"]["body"];
}) {
  const listingType = params?.listingType || "categoryListing";
  let categoryId = params?.categoryId || null;

  const {apiClient} = useHeyFrameContext();

  let searchMethod: typeof listingType extends "productSearchListing"
    ? (
      searchParams: operations["readProductListing post /product-listing/{categoryId}"]["body"],
    ) => Promise<Schemas["ProductListingResult"]>
    : (
      searchParams: operations["searchPage post /search"]["body"],
    ) => Promise<Schemas["ProductListingResult"]>;

  if (listingType === "productSearchListing") {
    searchMethod = async (
      searchCriteria: operations["searchPage post /search"]["body"],
    ) => {
      const {data} = await apiClient.invoke("searchPage post /search", {
        headers: {
          "sw-include-seo-urls": true,
        },
        body: searchCriteria,
      });
      return data;
    };
  } else {
    if (!categoryId) {
      const {category} = useCategory();
      categoryId = category.value?.id;
    }

    searchMethod = async (
      searchCriteria: operations["readProductListing post /product-listing/{categoryId}"]["body"],
    ) => {
      const {data} = await apiClient.invoke(
        "readProductListing post /product-listing/{categoryId}",
        {
          headers: {
            "sw-include-seo-urls": true,
          },
          pathParams: {
            categoryId: categoryId as string, // null exception in useCategory,
          },
          body: searchCriteria,
        },
      );
      return data;
    };
  }

  return createListingComposable({
    listingKey: listingType,
    searchMethod,
    searchDefaults:
      params?.defaultSearchCriteria ||
      ({} as operations["searchPage post /search"]["body"]), //getDefaults(),
  });
}

const [_createCategoryListingContext, _categoryListingContext] =
  createInjectionState(
    () => {
      return useListing({listingType: "categoryListing"});
    },
    {
      injectionKey: "categoryListing",
    },
  );

export const createCategoryListingContext = _createCategoryListingContext;

/**
 * Temporary workaround over `useListing` to support shared data. This composable API will change in the future.
 *
 * You need to call `createCategoryListingContext` before this composable.
 */
export const useCategoryListing = () => {
  const listingContext = _categoryListingContext();

  if (!listingContext) {
    throw new Error(
      "[useCategoryListing] Please call `createCategoryListingContext` on the appropriate parent component",
    );
  }

  return listingContext;
};

/**
 * Temporary workaround over `useListing` to support shared data. This composable API will change in the future.
 */
export const useProductSearchListing = createSharedComposable(() =>
  useListing({listingType: "productSearchListing"}),
);

export function createListingComposable({
                                          searchMethod,
                                          searchDefaults,
                                          listingKey,
                                        }: {
  searchMethod(
    searchParams:
      | operations["readProductListing post /product-listing/{categoryId}"]["body"]
      | operations["searchPage post /search"]["body"],
  ): Promise<Schemas["ProductListingResult"]>;
  searchDefaults: operations["searchPage post /search"]["body"];
  listingKey: string;
}) {
  const loading = ref(false);

  const _storeInitialListing: Ref<Schemas["ProductListingResult"] | null> =
    inject<Ref<Schemas["ProductListingResult"] | null>>(
      `useListingInitial-${listingKey}`
    ) ?? ref(null);
  provide(`useListingInitial-${listingKey}`, _storeInitialListing);

  const _storeAppliedListing: Ref<Schemas["ProductListingResult"] | null> =
    inject<Ref<Schemas["ProductListingResult"] | null>>(
      `useListingApplied-${listingKey}`
    ) ?? ref(null);
  provide(`useListingApplied-${listingKey}`, _storeAppliedListing);

  const getInitialListing = computed(() => _storeInitialListing.value);
  const setInitialListing = async (
    initialListing: Schemas["ProductListingResult"],
  ) => {
    _storeInitialListing.value = initialListing;
    _storeAppliedListing.value = null;
  };

  async function search(
    criteria: operations["searchPage post /search"]["body"],
  ) {
    loading.value = true;
    try {
      const searchCriteria = merge(
        {} as operations["searchPage post /search"]["body"],
        searchDefaults,
        criteria,
      );
      _storeAppliedListing.value = await searchMethod(searchCriteria);
    } finally {
      loading.value = false;
    }
  }

  const getCurrentListing = computed(() => {
    return _storeAppliedListing.value || getInitialListing.value;
  });
  const getElements = computed(() => {
    return getCurrentListing.value?.elements || [];
  });
  return {
    search,
    getElements
  }
}
