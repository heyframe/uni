import ViewAdapter from "@/core/adapter/view.adapter";
import type {App} from 'vue';
import {createApp} from 'vue';
import type ApplicationBootstrapper from "@/core/application";
import RootApp from "@/App.vue";
import {I18n} from "vue-i18n";

/**
 * @private
 */
export default class VueAdapter extends ViewAdapter {

  public app: App<Element>;

  private i18n?: I18n;

  constructor(Application: ApplicationBootstrapper) {
    super(Application);
    this.app = createApp(RootApp);
  }

  init(renderElement: string, providers: { [p: string]: unknown }): App<Element> {
    return this.initVue(renderElement, providers);
  }

  initVue(renderElement: string, providers: { [key: string]: unknown }): App<Element> {

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    const i18n = this.initLocales();

    if (!this.app) {
      throw new Error('Vue app is not initialized yet');
    }
    /**
     * This is a hack for providing the services to the components.
     * We shouldn't use this anymore because it is not supported well
     * in Vue3 (because the services are lazy loaded).
     *
     * So we should convert from provide/inject to HeyUni.Service
     */
    Object.keys(providers).forEach((provideKey) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Object.defineProperty(this.app._context.provides, provideKey, {
        get: () => providers[provideKey],
        enumerable: true,
        configurable: true,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        set() {
        },
      });
    });

    this.root = this.app;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.app.mount(renderElement);
    return this.root;
  }
  /**
   * Initialises the standard locales.
   */
  initLocales() {

  }
  deleteReactive(target: unknown, propertyName: string): void {
  }

  /**
   * Returns the name of the adapter
   */
  getName(): string {
    return 'Vue.js';
  }

  /**
   * Returns the adapter wrapper
   */
  getWrapper() {
    return this.app;
  }

  /**
   * Returns the Vue.set function
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReactive(this: void, target: any, propertyName: string, value: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    target[propertyName] = value;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return target[propertyName];
  }

}
