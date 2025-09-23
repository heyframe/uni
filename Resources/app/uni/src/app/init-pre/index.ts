/**
 *
 * These types of initializers are called in the beginning of the initialization process.
 * They can decorate the following initializer.
 */
import initStore from './store.init';
import initApiServices from './api-services.init';
// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default {
    apiServices: initApiServices,
    store: initStore,
};
