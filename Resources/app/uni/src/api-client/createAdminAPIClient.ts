import defu from "defu";
import { createHooks } from "hookable";
import type { operations } from "@/api-client/api-types/adminApiTypes";
import type { InvokeParameters } from "@/api-client/createAPIClient";
import type { GlobalFetchOptions } from "@/api-client/createAPIClient";
import { type ClientHeaders, createHeaders } from "@/api-client/defaultHeaders";
import { errorInterceptor } from "@/api-client/errorInterceptor";
import { createPathWithParams } from "@/api-client/transformPathToQuery";

type SimpleUnionOmit<T, K extends string | number | symbol> = T extends unknown
    ? Omit<T, K>
    : never;

type SimpleUnionPick<T, K extends keyof T> = T extends unknown
    ? Pick<T, K>
    : never;

type RenameByT<T, U> = {
    [K in keyof U as K extends keyof T
        ? T[K] extends string
            ? T[K]
            : never
        : K]: K extends keyof U ? U[K] : never;
};

/**
 * Session data entity for admin API client.
 */
export type AdminSessionData = {
    accessToken: string;
    refreshToken?: string;
    expirationTime: number;
};

export type RequestReturnType<
    CURRENT_OPERATION extends {
        response: unknown;
        responseCode: number;
    },
> = RenameByT<
    { response: "data"; responseCode: "status" },
    SimpleUnionPick<CURRENT_OPERATION, "response" | "responseCode">
>;

function createAuthorizationHeader(token: string) {
    if (!token) return "";
    if (token.startsWith("Bearer ")) return token;
    return `Bearer ${token}`;
}

export type AdminApiClientHooks = {
    onAuthChange: (authData: AdminSessionData) => void;
    onResponseError: (response: UniApp.RequestSuccessCallbackResult) => void;
    onSuccessResponse: (response: UniApp.RequestSuccessCallbackResult) => void;
    onDefaultHeaderChanged: <T>(headerName: string, value?: T) => void;
};

export function createAdminAPIClient<
    OPERATIONS extends Record<string, any> = operations,
    PATHS extends string | number | symbol = keyof OPERATIONS,
>(params: {
    baseURL?: string;
    /**
     * If you pass `credentials` object, it will be used to authenticate the client whenever session expires.
     * You don't need to manually invoke `/token` endpoint first.
     */
    credentials?: OPERATIONS["token post /oauth/token"]["body"];
    sessionData?: AdminSessionData;
    defaultHeaders?: ClientHeaders;
    fetchOptions?: GlobalFetchOptions;
}) {
    const isTokenBasedAuth =
        params.credentials?.grant_type === "client_credentials";

    // Create a hookable instance
    const apiClientHooks = createHooks<AdminApiClientHooks>();

    const sessionData: AdminSessionData = {
        accessToken: params.sessionData?.accessToken || "",
        refreshToken: params.sessionData?.refreshToken || "",
        expirationTime: Number(params.sessionData?.expirationTime || 0),
    };

    const defaultHeaders = createHeaders(
        {
            Authorization: createAuthorizationHeader(sessionData.accessToken),
            Accept: "application/json",
            ...params.defaultHeaders,
        },
        (key, value) => {
            apiClientHooks.callHook("onDefaultHeaderChanged", key, value);
        },
    );

    function getSessionData() {
        return { ...sessionData };
    }

    function setSessionData(data: AdminSessionData): AdminSessionData {
        sessionData.accessToken = data.accessToken;
        sessionData.refreshToken = data.refreshToken || "";
        sessionData.expirationTime = data.expirationTime;

        return getSessionData();
    }

    function updateSessionData(responseData: {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
    }) {
        if (responseData?.access_token) {
            defaultHeaders.Authorization = createAuthorizationHeader(
                responseData.access_token,
            );

            const dataCopy = setSessionData({
                accessToken: responseData.access_token,
                refreshToken: responseData.refresh_token || "",
                expirationTime: Date.now() + (responseData.expires_in || 0) * 1000,
            });
            apiClientHooks.callHook("onAuthChange", dataCopy);
        }
    }

    async function refreshTokenIfNeeded() {
        const isExpired = sessionData.expirationTime <= Date.now();
        if (!isExpired) return;

        // 检查是否需要跳过刷新（基于原始逻辑）
        if (!params.credentials && !isTokenBasedAuth && !sessionData.refreshToken) {
            console.warn(
                "[ApiClientWarning] No `credentials` or `sessionData` provided. Provide at least one of them to ensure authentication.",
            );
            return;
        }

        const body =
            params.credentials && !sessionData.refreshToken
                ? params.credentials
                : {
                    grant_type: "refresh_token",
                    client_id: "administration",
                    refresh_token: sessionData.refreshToken,
                };

        return new Promise<void>((resolve, reject) => {
            uni.request({
                url: (params.baseURL || "") + "/oauth/token",
                method: "POST",
                data: body,
                header: defaultHeaders as Record<string, string>,
                success: (res) => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        updateSessionData(res.data as any);
                        resolve();
                    } else {
                        errorInterceptor(res as any);
                        reject(res);
                    }
                },
                fail: (err) => reject(err),
            });
        });
    }

    async function apiRequest(
        url: string,
        options: {
            method: string;
            data?: any;
            headers?: Record<string, string>;
            query?: any;
        },
        skipTokenRefresh = false
    ): Promise<UniApp.RequestSuccessCallbackResult> {
        // 如果不是token请求且不需要跳过刷新，则刷新token
        if (!skipTokenRefresh && !url.includes("/oauth/token")) {
            await refreshTokenIfNeeded();
        }

        // 处理查询参数
        let finalUrl = url;
        if (options.query) {
            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(options.query)) {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            }
            const queryString = queryParams.toString();
            if (queryString) {
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
            }
        }

        return new Promise((resolve, reject) => {
            uni.request({
                url: (params.baseURL || "") + finalUrl,
                method: options.method as any,
                data: options.data,
                header: defu(options.headers, defaultHeaders) as Record<string, string>,
                success: (res) => {
                    apiClientHooks.callHook("onSuccessResponse", res);

                    // 更新会话数据（如果响应中包含令牌信息）
                    if (res.data && typeof res.data === 'object') {
                        updateSessionData(res.data as any);
                    }

                    resolve(res);
                },
                fail: (err) => {
                    apiClientHooks.callHook("onResponseError", err as any);
                    errorInterceptor(err as any);
                    reject(err);
                },
            });
        });
    }

    /**
     * Invoke API request based on provided path definition.
     */
    async function invoke<
        INVOKE_PATH extends PATHS,
        OPERATION_NAME extends string = INVOKE_PATH extends `${infer R}`
            ? R extends string
                ? R
                : never
            : never,
        CURRENT_OPERATION extends
            OPERATIONS[OPERATION_NAME] = OPERATION_NAME extends keyof OPERATIONS
            ? OPERATIONS[OPERATION_NAME]
            : never,
    >(
        pathParam: OPERATION_NAME extends keyof OPERATIONS ? OPERATION_NAME : never,
        ...params: SimpleUnionOmit<
            CURRENT_OPERATION,
            "response" | "responseCode"
        > extends
            | {
            body: unknown;
        }
            | {
            query: unknown;
        }
            | {
            header: unknown;
        }
            | {
            pathParams: unknown;
        }
            ? [InvokeParameters<CURRENT_OPERATION>]
            : [InvokeParameters<CURRENT_OPERATION>?]
    ): Promise<RequestReturnType<CURRENT_OPERATION>> {
        const [, method, requestPath] = (pathParam as string).split(" ") as [
            string,
            string,
            string,
        ];

        const currentParams =
            params[0] || ({} as InvokeParameters<CURRENT_OPERATION>);

        const requestPathWithParams = createPathWithParams(
            requestPath,
            currentParams.pathParams,
        );

        const resp = await apiRequest(requestPathWithParams, {
            method,
            data: currentParams.body,
            headers: currentParams.headers as Record<string, string>,
            query: currentParams.query,
        });

        return {
            data: resp.data,
            status: resp.statusCode || 0,
        } as RequestReturnType<CURRENT_OPERATION>;
    }

    return {
        invoke,
        /**
         * Enables to change session data in runtime. Useful for testing purposes.
         * Setting session data with this method will **not** fire `onAuthChange` hook.
         */
        setSessionData,
        /**
         * Returns current session data. Useful for testing purposes, as in most cases you'll want to use `onAuthChange` hook for that.
         */
        getSessionData,
        /**
         * Default headers used in every client request (if not overriden in specific request).
         */
        defaultHeaders,
        /**
         * Available hooks for the client.
         */
        hook: apiClientHooks.hook,
    };
}
