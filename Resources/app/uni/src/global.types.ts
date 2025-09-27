import type {default as Bottle, Decorator} from 'bottlejs';
import type ApiServiceFactory from '@/core/factory/api-service.factory';
import type AccountService from "@/core/service/api/account.service";
import type {ApiContextStore} from "@/app/store/api.context.store";
import type LocaleFactory from '@/core/factory/locale.factory';


export interface SubContainer<ContainerName extends string> {
  $decorator(name: string | Decorator, func?: Decorator): this;

  $register(Obj: Bottle.IRegisterableObject): this;

  $list(): (keyof Bottle.IContainer[ContainerName])[];
}

declare global {
  /**
   * "any" type which looks more awful in the code so that spot easier
   * the places where we need to fix the TS types
   */
  type $TSFixMe = any;

  interface CustomHeyUniProperties {
  }


  interface InitPostContainer extends SubContainer<'init-post'> {
  }

  interface InitPreContainer extends SubContainer<'init-pre'> {
    state: $TSFixMe;
  }

  interface FactoryContainer extends SubContainer<'factory'> {
    serviceFactory: $TSFixMe;
    apiService: typeof ApiServiceFactory;
    locale: typeof LocaleFactory;
  }

  /**
   * Define global container for the bottle.js containers
   */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ServiceContainer extends SubContainer<'service'> {
    accountService: AccountService;
  }

  interface InitContainer extends SubContainer<'init'> {
    httpClient: $TSFixMe;
  }

  interface PiniaRootState {
    apiContext: ApiContextStore;
  }

  type apiContext = ApiContextStore['api'];
}
/**
 * Link global bottle.js container to the bottle.js container interface
 */
declare module 'bottlejs' {
  // Use the same module name as the import string
  type IContainerChildren = 'factory' | 'service' | 'init' | 'init-post' | 'init-pre';

  interface IContainer {
    factory: FactoryContainer;
    service: ServiceContainer;
    'init-pre': InitPreContainer;
    init: InitContainer;
    'init-post': InitPostContainer;
  }
}
