import HeyUni from "@/heyuni-instance";
import {inject} from "@vue/runtime-core";

export type HeyFrameContext = {
  apiClient: $TSFixMe;
  /**
   * Browser locale, working in SSR
   * If not provided, it will be "zh-CN"
   */
  browserLocale: string;
};

export function useHeyFrameContext(): HeyFrameContext {

  const initContainer = HeyUni.Application.getContainer('init');
  return {
    apiClient: initContainer.httpClient,
    browserLocale: "zh-CN",
  };
}
