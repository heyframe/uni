import {Schemas} from "@/api-client/api-types/frontApiTypes";

/**
 * Returns default order associations. You can override this composable in your project.
 * @public
 * @category Order
 */
export function useDefaultOrderAssociations(): Schemas["Criteria"]["associations"] {
  return {
    stateMachineState: {},
    lineItems: {
      associations: {
        cover: {},
        downloads: {
          associations: {
            media: {},
          },
        },
      },
    },
    transactions: {
      associations: {
        paymentMethod: {},
        stateMachineState: {},
      },
    },
  };
}
