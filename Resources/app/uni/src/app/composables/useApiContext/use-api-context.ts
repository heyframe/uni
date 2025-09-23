import { computed, reactive } from 'vue';

/**
 * @private
 */
export interface ApiContextState {
  api:{
    baseURL: null | string;
    accessToken: null | string;
  }
}

const state: ApiContextState = reactive({
  api:{
    baseURL: null,
    accessToken: null,
  }
});

function addApiValue<K extends keyof ApiContextState['api']>({ key, value }: { key: K; value: ApiContextState['api'][K] }) {
  state.api[key] = value;
}

/**
 * @private
 */
export default function useApiContext() {
  return {
    ...state,
    addApiValue,
  };
}
