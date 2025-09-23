import type Bottle from 'bottlejs';
import type VueAdapter from "@/app/adapter/view/vue.adapter";
import type {ContextStore} from "@/app/store/api.context.store";
import HeyUni from "@/heyuni-instance";

class ApplicationBootstrapper {
    public $container: Bottle;
    public view: null | VueAdapter;

    constructor(container: Bottle) {
        const noop = (): void => {
        };
        this.$container = container;
        this.view = null;
        this.$container.service('service', noop);
        this.$container.service('init', noop);
        this.$container.service('factory', noop);
        this.$container.service('init-pre', noop);
        this.$container.service('init-post', noop);
    }

    start(config = {}): Promise<void | ApplicationBootstrapper> {
        return this.initState().registerConfig(config).startBootProcess();
    }

    /**
     * Boot the application depending on login status
     */
    async startBootProcess(): Promise<void | ApplicationBootstrapper> {
        return this.bootFullApplication();
    }

    /**
     * Boot the whole vite application.
     */
    bootFullApplication(): Promise<void | ApplicationBootstrapper> {
        const initPreContainer = this.getContainer('init-pre');
        const initContainer = this.getContainer('init');
        const initPostContainer = this.getContainer('init-post');

        return this.initializeInitializers(initPreContainer, '-pre')
            .then(() => this.initializeInitializers(initContainer))
            .then(() => this.initializeInitializers(initPostContainer, '-post'))
            .then(() => this.createApplicationRoot())
            .catch((error) => this.createApplicationRootError(error));
    }

    /**
     * Creates the application root and injects the provider container into the
     * view instance to keep the dependency injection of Vue.js in place.
     */
    createApplicationRoot(): Promise<ApplicationBootstrapper> {
        if (!this.view) {
            return Promise.reject(new Error('The ViewAdapter was not defined in the application.'));
        }
        this.view.init(
            '#app',
            // @ts-expect-error
            this.getContainer('service'),
        );
        return Promise.resolve(this);
    }
    registerConfig(config: { apiContext?: ContextStore['api']; }): ApplicationBootstrapper {
        if (config.apiContext) {
            this.registerApiContext(config.apiContext);
        }
        return this;
    }
    /**
     * Registers the api context (api path, path to resources etc.)
     */
    registerApiContext(context: ContextStore['api']): ApplicationBootstrapper {
        HeyUni.Context.api = HeyUni.Classes._private.ApiContextFactory(context);

        return this;
    }

    /**
     * Creates the application root and show the error message.
     */
    createApplicationRootError(error: unknown): void {
        this.view?.init(
            '#app',
            // @ts-expect-error
            this.getContainer('service'),
        );

        // @ts-expect-error
        if (this.view?.root?.initError) {
            // @ts-expect-error
            this.view.root.initError = error;
        }
    }

    /**
     * Initialize the initializers for Vite.
     */
    // eslint-disable-next-line max-len
    private initializeInitializers(
        container: InitContainer | InitPreContainer | InitPostContainer,
        suffix: '' | '-pre' | '-post' = '',
    ): Promise<unknown[]> {
        // This will initialize the pre-initializers, initializers or post-initializers based on the suffix
        const services = container.$list().map((serviceName) => {
            return `init${suffix}.${serviceName}`;
        });

        this.$container.digest(services);

        const asyncInitializers = this.getAsyncInitializers(container, suffix);
        return Promise.all(asyncInitializers);
    }

    // eslint-disable-next-line max-len
    getAsyncInitializers(
        initializer: InitContainer | InitPostContainer | InitPreContainer | string[],
        suffix: '' | '-pre' | '-post' = '',
    ): unknown[] {
        const initContainer = this.getContainer(`init${suffix}`);
        const asyncInitializers: unknown[] = [];

        let initializerStrings = initializer;

        if (!(initializer instanceof Array)) {
            initializerStrings = Object.keys(initializer);
        }

        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        initializerStrings.forEach((serviceKey: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const service = initContainer[serviceKey];

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (service?.constructor?.name === 'Promise') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                asyncInitializers.push(service);
            }
        });

        return asyncInitializers;
    }

    /**
     * Get the global state
     */
    initState(): ApplicationBootstrapper {
        return this;
    }

    /**
     * Returns all containers. Use this method if you want to get initializers in your services.
     */
    getContainer<T extends Bottle.IContainerChildren>(containerName: T): Bottle.IContainer[T] {
        if (typeof containerName === 'string' && this.$container.container[containerName]) {
            return this.$container.container[containerName];
        }

        // @ts-expect-error
        return this.$container.container;
    }

    /**
     * Adds a factory to the application. A factory creates objects for the domain.
     *
     * The factory will be registered in a nested DI container.
     *
     * @example
     * HeyUni.Application.addFactory('module', (container) => {
     *    return ModuleFactory();
     * });
     */
    addFactory<T extends keyof FactoryContainer>(
        name: T,
        factory: (container: Bottle.IContainer) => FactoryContainer[T],
    ): ApplicationBootstrapper {
        this.$container.factory(`factory.${name}`, factory.bind(this));

        return this;
    }

    addFactoryMiddleware<SERVICE extends keyof Bottle.IContainer['factory']>(
        nameOrMiddleware: SERVICE | Bottle.Middleware,
        middleware?: Bottle.Middleware,
    ): ApplicationBootstrapper {
        return this._addMiddleware('factory', nameOrMiddleware, middleware);
    }

    addFactoryDecorator(
        nameOrDecorator: keyof FactoryContainer | Bottle.Decorator,
        decorator?: Bottle.Decorator,
    ): ApplicationBootstrapper {
        return this._addDecorator('factory', nameOrDecorator, decorator);
    }


    /**
     * Helper method which registers a middleware
     */
    private _addMiddleware<CONTAINER extends Bottle.IContainerChildren>(
        containerName: CONTAINER,
        nameOrMiddleware: keyof Bottle.IContainer[CONTAINER] | Bottle.Middleware,
        middleware?: Bottle.Middleware,
    ): ApplicationBootstrapper {
        if (typeof nameOrMiddleware === 'string' && !!middleware) {
            this.$container.middleware(`${containerName}.${nameOrMiddleware}`, middleware);
        }

        if (typeof nameOrMiddleware === 'function' && !!nameOrMiddleware) {
            this.$container.middleware(containerName, nameOrMiddleware);
        }

        return this;
    }

    /**
     * Adds an initializer to the application. An initializer is a necessary part of the application which needs to be
     * initialized before we can boot up the application.
     *
     * The initializer will be registered in a nested DI container.
     *
     * @example
     * HeyUni.Application.addInitializer('httpClient', (container) => {
     *    return HttpFactory(container.apiContext);
     * });
     */
    addInitializer<I extends keyof InitContainer>(
        name: I,
        initializer: () => InitContainer[I],
        suffix: string = '',
    ): ApplicationBootstrapper {
        this.$container.factory(`init${suffix}.${name}`, initializer.bind(this));
        return this;
    }

    /**
     * Registers optional services & provider for the application. Services are usually
     * API gateways but can be a simple service.
     *
     * The service will be added to a nested DI container.
     *
     * @example
     * HeyUni.Application.addServiceProvider('productService', (container) => {
     *    return new ProductApiService(container.mediaService);
     * });
     */
    addServiceProvider<S extends keyof ServiceContainer>(
        name: S,
        provider: (serviceContainer: ServiceContainer) => ServiceContainer[S],
    ): ApplicationBootstrapper {
        this.$container.factory(`service.${name}`, provider.bind(this));
        return this;
    }

    /**
     * Registers a service provider middleware for either every service provider in the container or a defined one.
     *
     * @example
     * HeyUni.Application.addServiceProviderMiddleware((container, next) => {
     *    // Do something with the container
     *    next();
     * });
     *
     * @example
     * HeyUni.Application.addServiceProviderMiddleware('productService', (service, next) => {
     *    // Do something with the service
     *    next();
     * });
     */
    addServiceProviderMiddleware<SERVICE extends keyof ServiceContainer>(
        nameOrMiddleware: SERVICE | Bottle.Middleware,
        middleware?: (service: ServiceContainer[SERVICE], next: (error?: Error) => void) => void,
    ): ApplicationBootstrapper {
        return this._addMiddleware('service', nameOrMiddleware, middleware);
    }

    /**
     * Registers a service provider decorator for either every service provider in the container or a defined one.
     *
     * @example
     * HeyUni.Application.addServiceProviderDecorator((container, next) => {
     *    // Do something with the container
     *    next();
     * });
     *
     * @example
     * HeyUni.Application.addServiceProviderDecorator('productService', (service, next) => {
     *    // Do something with the service
     *    next();
     * });
     */
    addServiceProviderDecorator(
        nameOrDecorator: keyof ServiceContainer | Bottle.Decorator,
        decorator?: Bottle.Decorator,
    ): ApplicationBootstrapper {
        return this._addDecorator('service', nameOrDecorator, decorator);
    }

    /**
     * Helper method which registers a decorator
     */
    _addDecorator<CONTAINER extends Bottle.IContainerChildren>(
        containerName: CONTAINER,
        nameOrDecorator: keyof Bottle.IContainer[CONTAINER] | Bottle.Decorator,
        decorator?: Bottle.Decorator,
    ): ApplicationBootstrapper {
        if (typeof nameOrDecorator === 'string' && !!decorator) {
            this.$container.decorator(`${containerName}.${nameOrDecorator}`, decorator);
        }

        if (typeof nameOrDecorator === 'function' && !!nameOrDecorator) {
            this.$container.decorator(containerName, nameOrDecorator);
        }

        return this;
    }

    setViewAdapter(viewAdapterInstance: VueAdapter): void {
        this.view = viewAdapterInstance;
    }

}

export default ApplicationBootstrapper;
