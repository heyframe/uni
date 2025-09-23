/**
 * @sw-package framework
 */
import HeyUni from "@/heyuni-instance";

// eslint-disable-next-line sw-deprecation-rules/private-feature-declarations
export default async function initializeLocaleService() {
    const factoryContainer = HeyUni.Application.getContainer('factory');
    const localeFactory = factoryContainer.locale;

    // Register default snippets
    localeFactory.register('zh-CN', {});

    return localeFactory;
}
