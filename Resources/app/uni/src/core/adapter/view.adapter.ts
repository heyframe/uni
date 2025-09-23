import type ApplicationBootstrapper from "@/core/application";
import type { App } from 'vue';
export default abstract class ViewAdapter {
    public Application: ApplicationBootstrapper;
    public applicationFactory: FactoryContainer;
    public root: App<Element> | null;
    /**
     * @constructor
     */
    constructor(Application: ApplicationBootstrapper) {
        this.Application = Application;
        this.applicationFactory = Application.getContainer('factory');
        this.root = null;
    }
    /**
     * Creates the main instance for the view layer.
     * Is used on startup process of the main application.
     */
    abstract init(renderElement: string,providers: { [key: string]: unknown }): App | null;

    /**
     * Returns the adapter wrapper
     */
    abstract getWrapper(): App<Element> | undefined;

    /**
     * Returns the name of the adapter
     */
    abstract getName(): string;
    /**
     * Returns the Vue.set function
     */
    abstract setReactive(target: unknown, propertyName: string, value: unknown): unknown;

    /**
     * Returns the Vue.delete function
     */
    abstract deleteReactive(target: unknown, propertyName: string): void;
}