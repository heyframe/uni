import HeyUni from "@/heyuni-instance";
import ApiServiceList from "@/core/service/api";

export default async function initializeApiServices() {
  const factoryContainer = HeyUni.Application.getContainer('factory');
  const initContainer = HeyUni.Application.getContainer('init');
  const apiServiceFactory = factoryContainer.apiService;

  for (const ApiServicePromise of ApiServiceList()) {
    const ApiServiceRaw = await ApiServicePromise();
    const ApiService = ApiServiceRaw.default;

    const service = new ApiService(initContainer.httpClient);
    const serviceName = service.name as keyof ServiceContainer;

    apiServiceFactory.register(serviceName, service);
    HeyUni.Application.addServiceProvider(serviceName, () => service);
  }
}
