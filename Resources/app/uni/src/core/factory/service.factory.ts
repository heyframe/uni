/**
 * @sw-package framework
 */
import HeyUni from "@/heyuni-instance";

type ServiceObject = {
    get: <SN extends keyof ServiceContainer>(serviceName: SN) => ServiceContainer[SN];
    list: () => (keyof ServiceContainer)[];
    register: typeof HeyUni.Application.addServiceProvider;
    registerMiddleware: typeof HeyUni.Application.addServiceProviderMiddleware;
    registerDecorator: typeof HeyUni.Application.addServiceProviderDecorator;
};

/**
 * Return the ServiceObject (HeyUni.Service().myService)
 * or direct access the services (HeyUni.Service('myService')
 */
function serviceAccessor<SN extends keyof ServiceContainer>(serviceName: SN): ServiceContainer[SN];
function serviceAccessor(): ServiceObject;
function serviceAccessor<SN extends keyof ServiceContainer>(serviceName?: SN): ServiceContainer[SN] | ServiceObject {
    if (serviceName) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return HeyUni.Application.getContainer('service')[serviceName];
    }

    const serviceObject: ServiceObject = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        get: (name) => HeyUni.Application.getContainer('service')[name],
        list: () => HeyUni.Application.getContainer('service').$list(),
        register: (name, service) => HeyUni.Application.addServiceProvider(name, service),
        registerMiddleware: (...args) => HeyUni.Application.addServiceProviderMiddleware(...args),
        registerDecorator: (...args) => HeyUni.Application.addServiceProviderDecorator(...args),
    };

    return serviceObject;
}

// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default serviceAccessor;
