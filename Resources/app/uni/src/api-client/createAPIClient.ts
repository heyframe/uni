import defu from "defu";
import { createHooks } from "hookable";
import type { operations } from "@/api-client/api-types/frontApiTypes";
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

export type RequestReturnType<
    CURRENT_OPERATION extends {
        response: unknown;
        responseCode: number;
    },
> = RenameByT<
    { response: "data"; responseCode: "status" },
    SimpleUnionPick<CURRENT_OPERATION, "response" | "responseCode">
>;

export type RequestParameters<CURRENT_OPERATION> = SimpleUnionOmit<
    CURRENT_OPERATION,
    "response" | "responseCode"
>;

export type InvokeParameters<CURRENT_OPERATION> =
    RequestParameters<CURRENT_OPERATION> & {
    requestOptions?: Partial<UniApp.RequestOptions>;
};

export type GlobalFetchOptions = Pick<
    UniApp.RequestOptions,
    "timeout"
>;

export type ApiClientHooks = {
    onContextChanged: (newContextToken: string) => void;
    onResponseError: (response: UniApp.RequestSuccessCallbackResult) => void;
    onSuccessResponse: <T>(response: UniApp.RequestSuccessCallbackResult & { data: T }) => void;
    onDefaultHeaderChanged: <T>(headerName: string, value?: T) => void;
    onRequest: (options: UniApp.RequestOptions) => void;
};

export function createAPIClient<
    OPERATIONS extends Record<string, any> = operations,
    PATHS extends string | number | symbol = keyof OPERATIONS,
>(params: {
    baseURL?: string;
    accessToken?: string;
    contextToken?: string;
    defaultHeaders?: ClientHeaders;
    fetchOptions?: GlobalFetchOptions;
}) {
    // Create a hookable instance
    const apiClientHooks = createHooks<ApiClientHooks>();

    const defaultHeaders = createHeaders(
        {
            "sw-access-key": params.accessToken,
            "accept": "application/json",
            "sw-context-token": params.contextToken,
            ...params.defaultHeaders,
        },
        (key, value) => {
            apiClientHooks.callHook("onDefaultHeaderChanged", key, value);
            if (key === "sw-context-token" && value) {
                apiClientHooks.callHook("onContextChanged", value);
            }
        },
    );

    let currentBaseURL = params.baseURL;
    let currentAccessToken = params.accessToken;

    async function apiRequest(
        method: UniApp.RequestOptions["method"],
        url: string,
        options: InvokeParameters<any>
    ): Promise<UniApp.RequestSuccessCallbackResult> {
        return new Promise((resolve, reject) => {
            // 合并 headers
            const headers = defu(options.headers, defaultHeaders);

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

            const requestOptions: UniApp.RequestOptions = {
                url: currentBaseURL ? currentBaseURL + finalUrl : finalUrl,
                method,
                header: headers as Record<string, string>,
                data: options.body,
                timeout: params.fetchOptions?.timeout,
                success: (res) => {
                    apiClientHooks.callHook("onSuccessResponse", res as any);

                    // 更新 context token
                    const newToken = res.header?.["sw-context-token"];
                    if (newToken && defaultHeaders["sw-context-token"] !== newToken) {
                        defaultHeaders["sw-context-token"] = newToken;
                        apiClientHooks.callHook("onContextChanged", newToken);
                    }

                    resolve(res);
                },
                fail: (err) => {
                    apiClientHooks.callHook("onResponseError", err as any);
                    errorInterceptor(err as any);
                    reject(err);
                },
            };

            apiClientHooks.callHook("onRequest", requestOptions);
            uni.request({ ...requestOptions, ...(options.requestOptions || {}) });
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

        const resp = await apiRequest(method as any, requestPathWithParams, currentParams);

        return {
            data: resp.data,
            status: resp.statusCode || 0,
            headers: resp.header || {},
        } as RequestReturnType<CURRENT_OPERATION>;
    }

    return {
        invoke,
        /**
         * Default headers used in every client request (if not overriden in specific request).
         */
        defaultHeaders,
        hook: apiClientHooks.hook,
        /**
         * Update the base configuration for API client
         */
        updateBaseConfig: (config: { baseURL?: string; accessToken?: string }) => {
            if (config.baseURL !== undefined) currentBaseURL = config.baseURL;
            if (config.accessToken !== undefined) {
                currentAccessToken = config.accessToken;
                defaultHeaders["sw-access-key"] = config.accessToken;
            }
        },
        /**
         * Get the current base configuration
         */
        getBaseConfig: () => ({
            baseURL: currentBaseURL,
            accessToken: currentAccessToken,
        }),
    };
}
