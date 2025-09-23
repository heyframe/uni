import ApiService from "@/core/service/api.service";

class ContextService extends ApiService {
  constructor(httpClient) {
    super(httpClient);
    this.name = 'contextService';
  }


}
