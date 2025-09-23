import { defu } from "defu";
import { computed, inject, provide, ref } from "vue";
import type { ComputedRef, Ref } from "vue";
import {operations, Schemas} from "@/api-client/api-types/frontApiTypes";
import {useHeyFrameContext} from "@/app/composables/useHeyFrameContext/useHeyFrameContext";
import {useDefaultOrderAssociations} from "@/app/composables/useDefaultOrderAssociations/useDefaultOrderAssociations";


export type UseOrderDetailsReturn = {
  /**
   * {@link Schemas['Order']} object
   */
  order: ComputedRef<Schemas["Order"] | undefined | null>;
  /**
   * Order status (e.g. 'Open', 'Cancelled')
   */
  status: ComputedRef<string | undefined>;
  /**
   * Order status technical name (e.g. 'open', 'cancelled')
   */
  statusTechnicalName: ComputedRef<string | undefined>;
  /**
   * Order total price
   */
  total: ComputedRef<number | undefined>;
  /**
   * Order subtotal price for all items
   */
  subtotal: ComputedRef<number | undefined>;

  /**
   * Basic personal details
   */
  personalDetails: ComputedRef<{
    email: string | undefined;
    nickname: string | undefined;
    name: string | undefined;
  }>;
  /**
   * Payment URL for external payment methods (e.g. async payment in external payment gateway)
   */
  paymentUrl: Ref<null | string>;

  /**
   * Returns current selected payment method for the order. Last element in transactions array.
   */
  paymentMethod: ComputedRef<Schemas["PaymentMethod"] | undefined | null>;
  /**
   * Get order object including additional associations.
   * useDefaults describes what order object should look like.
   */
  loadOrderDetails(): Promise<Schemas["OrderRouteResponse"]>;
  /**
   * Handle payment for existing error.
   *
   * Pass custom success and error URLs (optionally).
   */
  handlePayment(
    successUrl?: string,
    errorUrl?: string,
    paymentDetails?: unknown,
  ): void;
  /**
   * Cancel an order.
   *
   * Action cannot be reverted.
   */
  cancel(): Promise<Schemas["StateMachineState"]>;
  /**
   * Changes the payment method for current cart.
   * @param paymentMethodId - ID of the payment method to be set
   * @returns
   */
  changePaymentMethod(
    paymentMethodId: string,
  ): Promise<Schemas["SuccessResponse"]>;
  /**
   * Get media content
   *
   * @param {string} downloadId
   * @returns {Blob}
   */
  getMediaFile: (downloadId: string) => Promise<Blob>;
  /**
   * Get order documents
   * @param {string} documentId
   * @param {string} deepLinkCode
   * @returns
   */

  /**
   * Fetches all available payment methods
   */
  getPaymentMethods(): Promise<Schemas["PaymentMethod"][]>;

  paymentChangeable: ComputedRef<boolean>;
};

/**
 * Composable for managing an existing order.
 * @public
 * @category Customer & Account
 */
export function useOrderDetails(
  orderId: string,
  associations?: Schemas["Criteria"]["associations"],
): UseOrderDetailsReturn {
  const { apiClient } = useHeyFrameContext();

  const paymentChangeableList: Ref<{ [key: string]: boolean }> = ref({});
  const _sharedOrder = inject<Ref<Schemas["Order"] | undefined>>(
    "swOrderDetails",
    ref(),
  );
  provide("swOrderDetails", _sharedOrder);

  const orderAssociations = useDefaultOrderAssociations();

  const paymentMethod = computed(() => {
    const transactions = _sharedOrder.value?.transactions;
    if (!transactions?.length) return undefined;
    return transactions[transactions.length - 1]?.paymentMethod;
  });

  const shippingMethod = computed(() => {
    const deliveries = _sharedOrder.value?.deliveries;
    if (!deliveries?.length) return undefined;
    return deliveries[deliveries.length - 1]?.shippingMethod;
  });

  const paymentUrl = ref();

  const personalDetails = computed(() => ({
    email: _sharedOrder.value?.orderCustomer?.email,
    nickname: _sharedOrder.value?.orderCustomer?.nickname,
    name: _sharedOrder.value?.orderCustomer?.name,
  }));
  const billingAddress = computed(() =>
    _sharedOrder.value?.addresses?.find(
      ({ id }: { id: string }) => id === _sharedOrder.value?.billingAddressId,
    ),
  );
  const shippingAddress = computed(
    () => _sharedOrder.value?.deliveries?.[0]?.shippingOrderAddress,
  );

  const shippingCosts = computed(() => _sharedOrder.value?.shippingTotal);
  const subtotal = computed(() => _sharedOrder.value?.price?.positionPrice);
  const total = computed(() => _sharedOrder.value?.price?.totalPrice);
  const status = computed(
    () => _sharedOrder.value?.stateMachineState?.translated.name,
  );
  const statusTechnicalName = computed(
    () => _sharedOrder.value?.stateMachineState?.technicalName,
  );

  async function loadOrderDetails() {
    const mergedAssociations = defu(
      orderAssociations,
      associations ? associations : {},
    );
    const params: operations["readOrder post /order"]["body"] = {
      ids: [orderId],
      associations: mergedAssociations,
      checkPromotion: true,
    };

    const orderDetailsResponse = await apiClient.invoke(
      "readOrder post /order",
      {
        body: params,
      },
    );
    _sharedOrder.value =
      orderDetailsResponse.data.orders?.elements?.[0] ?? undefined;
    paymentChangeableList.value =
      orderDetailsResponse.data.paymentChangeable ?? {};
    return orderDetailsResponse.data;
  }

  async function handlePayment(finishUrl?: string, errorUrl?: string) {
    const resp = await apiClient.invoke(
      "handlePaymentMethod post /handle-payment",
      {
        body: {
          orderId,
          finishUrl,
          errorUrl,
        },
      },
    );

    paymentUrl.value = resp.data.redirectUrl;
  }

  async function cancel() {
    const resp = await apiClient.invoke(
      "cancelOrder post /order/state/cancel",
      {
        body: {
          orderId,
        },
      },
    );
    await loadOrderDetails();
    return resp.data;
  }
  async function changePaymentMethod(paymentMethodId: string) {
    const response = await apiClient.invoke(
      "orderSetPayment post /order/payment",
      {
        body: {
          orderId: orderId,
          paymentMethodId: paymentMethodId,
        },
      },
    );

    await loadOrderDetails();
    return response.data;
  }

  async function getMediaFile(downloadId: string) {
    const response = await apiClient.invoke(
      "orderDownloadFile get /order/download/{orderId}/{downloadId}",
      {
        accept: "application/octet-stream",
        pathParams: {
          orderId,
          downloadId,
        },
      },
    );

    return response.data;
  }

  async function getDocumentFile(documentId: string, deepLinkCode: string) {
    const response = await apiClient.invoke(
      "download post /document/download/{documentId}/{deepLinkCode}",
      {
        pathParams: {
          documentId,
          deepLinkCode,
        },
      },
    );

    return response.data;
  }

  const paymentChangeable = computed(() => {
    return paymentChangeableList.value?.[orderId as string] ?? false;
  });

  const getPaymentMethods = async () => {
    const response = await apiClient.invoke(
      "readPaymentMethod post /payment-method",
      {
        body: { onlyAvailable: true },
      },
    );
    return response.data.elements || [];
  };

  return {
    order: computed(() => _sharedOrder.value),
    status,
    statusTechnicalName,
    total,
    subtotal,
    personalDetails,
    paymentUrl,
    paymentMethod,
    loadOrderDetails,
    handlePayment,
    cancel,
    changePaymentMethod,
    getMediaFile,
    paymentChangeable,
    getPaymentMethods,
  };
}
