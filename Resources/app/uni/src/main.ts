import HeyUni from "@/heyuni-instance";
import '@/app/main';
import 'uno.css'

import { apiConfig } from '@/config/env';

void (async () => {
  await HeyUni.Application.start({
    apiContext: {
      baseURL: apiConfig.baseURL,
      accessToken: apiConfig.accessToken,
    }
  });
})();
