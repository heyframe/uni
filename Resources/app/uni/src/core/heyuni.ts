import Bottle from 'bottlejs';
import ApplicationBootstrapper from "@/core/application";
import ServiceFactory from "@/core/factory/service.factory";
import ApiServices from '@/core/service/api';
import ApiServiceFactory from '@/core/factory/api-service.factory';
import Store from '@/app/store';
import useApiContext from '@/app/composables/useApiContext/use-api-context';
import HttpFactory from '@/core/factory/http.factory';
import ApiService from '@/core/service/api.service';
import ApiContextFactory from '@/core/factory/api-context.factory';
import LocaleFactory from "@/core/factory/locale.factory";


// strict mode was set to false because it was defined wrong previously
Bottle.config = { strict: false };
const container = new Bottle();

const application = new ApplicationBootstrapper(container);
application
    .addFactory('apiService', () => {
        return ApiServiceFactory;
    })
  .addFactory('locale', () => {
    return LocaleFactory;
  })
    .addFactory('serviceFactory', () => {
        return ServiceFactory;
    });

class HeyUniClass implements CustomHeyUniProperties {
    public Application = application;

    public Store = Store.instance;

    public Service = ServiceFactory;

    public ApiService = {
        register: ApiServiceFactory.register,
        getByName: ApiServiceFactory.getByName,
        getRegistry: ApiServiceFactory.getRegistry,
        getServices: ApiServiceFactory.getServices,
        has: ApiServiceFactory.has,
    };

    public get Context() {
        return useApiContext();
    }

    public _private = {
        ApiServices: ApiServices,
    };

    public Classes = {
        ApiService,
        _private: {
            HttpFactory,
            ApiContextFactory,
        },
    };
}

const HeyUniInstance = new HeyUniClass();

export { HeyUniClass, HeyUniInstance };
