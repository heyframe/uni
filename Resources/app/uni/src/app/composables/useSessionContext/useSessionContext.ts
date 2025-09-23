import {Schemas} from "@/api-client/api-types/frontApiTypes";
import {useHeyFrameContext} from "@/app/composables/useHeyFrameContext/useHeyFrameContext";
import {useContext} from "@/app/composables/useContext/useContext";
import {computed, ComputedRef} from "vue";

export type UseSessionContextReturn = {
  /**
   * Patches the context in order to use new language
   */
  setLanguage(language: Partial<Schemas["Language"]>): Promise<void>;
  /**
   * Patches the context in order to use new countryId
   *
   * @param {string} countryId
   */
  setCountry(countryId: string): Promise<void>;
  /**
   * current context's language
   */
  sessionContext: ComputedRef<Schemas["ChannelContext"] | undefined>;
  /**
   * Fetches the session context and assigns the result to the `sessionContext` property
   */
  refreshSessionContext(): Promise<void>;
  /**
   * current context's payment method
   */
  selectedPaymentMethod: ComputedRef<Schemas["PaymentMethod"] | null>;
  /**
   * Patches the context in order to use new payment method
   */
  setPaymentMethod(paymentMethod: { id: string }): Promise<void>;
  /**
   * current context's currency
   */
  currency: ComputedRef<Schemas["Currency"] | null>;
  /**
   * Patches the context in order to use new currency
   */
  setCurrency(currency: Partial<Schemas["Currency"]>): Promise<void>;
  /**
   * Patches the context with new context
   */
  setContext(context: Schemas["ChannelContext"]): void;
  /**
   * current context's country id
   */
  countryId: ComputedRef<string | undefined>;
  /**
   * current sales channel country id
   */
  channelCountryId: ComputedRef<string | undefined>;
  /**
   * current language id
   */
  languageId: ComputedRef<string | undefined>;
  /**
   * current language id chain
   */
  languageIdChain: ComputedRef<string>;
  /**
   * current context's customer object
   */
  userFromContext: ComputedRef<Schemas["Customer"] | undefined | null>;
}

export function useSessionContext(
  newContext?: Schemas["ChannelContext"],
): UseSessionContextReturn {
  const {apiClient} = useHeyFrameContext();

  const _sessionContext = useContext("swSessionContext", {
    replace: newContext,
  });

  const sessionContext = computed(() => _sessionContext.value);
  const refreshSessionContext = async () => {
    try {
      const {data} = await apiClient.invoke("readContext get /context");
      _sessionContext.value = data;
    } catch (e) {
      console.error("[UseSessionContext][refreshSessionContext]", e);
    }
  };

  const selectedPaymentMethod = computed(
    () => sessionContext.value?.paymentMethod || null,
  );
  const setPaymentMethod = async (paymentMethod: { id: string }) => {
    if (!paymentMethod?.id) {
      throw new Error(
        "You need to provide payment method id in order to set payment method.",
      );
    }
    await apiClient.invoke("updateContext patch /context", {
      body: {paymentMethodId: paymentMethod.id},
    });
    await refreshSessionContext();
  };

  const currency = computed(() => sessionContext.value?.currency || null);
  const setCurrency = async (currency: Partial<Schemas["Currency"]>) => {
    if (!currency.id) {
      console.error(
        "You need to provide currency id in order to set currency.",
        currency,
      );
      return;
    }
    await apiClient.invoke("updateContext patch /context", {
      body: {
        currencyId: currency.id,
      },
    });
    await refreshSessionContext();
  };

  const setLanguage = async (language: Partial<Schemas["Language"]>) => {
    if (!language.id) {
      return;
    }
    await apiClient.invoke("updateContext patch /context", {
      body: {
        languageId: language.id,
      },
    });
    await refreshSessionContext();
  };

  const setCountry = async (countryId: string) => {
    await apiClient.invoke("updateContext patch /context", {
      body: {
        countryId,
      },
    });
    await refreshSessionContext();
  };

  const setContext = (context: Schemas["ChannelContext"]) => {
    _sessionContext.value = context;
  };

  const countryId = computed(
    () => sessionContext.value?.shippingLocation?.country?.id,
  );

  const channelCountryId = computed(
    () => sessionContext.value?.channel?.countryId,
  );

  const languageId = computed(
    () => sessionContext.value?.channel?.languageId,
  );
  const languageIdChain = computed(
    () => sessionContext.value?.context?.languageIdChain?.[0] || "",
  );

  const userFromContext = computed(() => sessionContext.value?.customer);
  return {
    sessionContext,
    refreshSessionContext,
    selectedPaymentMethod,
    setPaymentMethod,
    currency,
    setCurrency,
    countryId,
    channelCountryId,
    userFromContext,
    setLanguage,
    languageId,
    languageIdChain,
    setCountry,
    setContext,
  }
}
