/**
 * @sw-package framework
 */
import useApiContext from '@/app/composables/useApiContext/use-api-context';
import HeyUni from "@/heyuni-instance";

const apiContextStore = HeyUni.Store.register('apiContext', useApiContext);

/**
 * @private
 * @description
 * The context store holds information about the current context of the application.
 */
export default apiContextStore;

/**
 * @private
 */
export type ApiContextStore = ReturnType<typeof apiContextStore>;
