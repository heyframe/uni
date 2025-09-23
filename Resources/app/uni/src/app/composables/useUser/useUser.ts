import {computed, type ComputedRef, type Ref, ref} from "vue";
import {useHeyFrameContext} from "@/app/composables/useHeyFrameContext/useHeyFrameContext";
import type {Schemas} from "@/api-client/api-types/frontApiTypes";

export type UseUserReturn = {
  /**
   * Logs-in user with given credentials
   * @param params - username and password
   *
   */
  login(params: { username: string; password: string }): Promise<void>;

  /**
   * Whole {@link Customer} object
   */
  user: ComputedRef<Schemas["Customer"] | undefined>;
  /**
   * Indicates if the user is logged in
   */
  isLoggedIn: ComputedRef<boolean>;
  /**
   * Fetches the user data from the API
   */
  refreshUser(params?: Schemas["Criteria"]): Promise<Schemas["Customer"]>;
}
export function useUser() {
  const { apiClient } = useHeyFrameContext();
  const user: Ref<Schemas["Customer"] | null> = ref(null);
  const country: Ref<any | null> = ref(null);

  const isLoggedIn: ComputedRef<boolean> = computed(
    () => !!user.value?.id && !!user.value?.active && !user.value?.guest
  );

  async function login(params: { username: string; password: string }) {
    let r = await apiClient.invoke("loginCustomer post /account/login", {
      method: "POST",
      body: params,
    });

    await refreshUser();
  }

  async function refreshUser() {
    const data =  await apiClient.invoke("readCustomer post /account/customer");
    user.value = data.data;
    return data;
  }


  return {
    user,
    isLoggedIn,
    login,
    refreshUser,
  };
}
