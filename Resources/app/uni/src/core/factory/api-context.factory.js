import useApiContext from '@/app/composables/useApiContext/use-api-context';
import HeyUni from "@/heyuni-instance";

/**
 * @sw-package framework
 *
 * @private
 * @module core/factory/context
 * @param {Object} context
 * @type factory
 */
export default function createContext(context = {}) {
    const contextStore = useApiContext();

    // assign unknown context information
    Object.entries(context).forEach(
        ([
            key,
            value,
        ]) => {
            contextStore.addApiValue({ key, value });
        },
    );

    return HeyUni.Context.api;
}
