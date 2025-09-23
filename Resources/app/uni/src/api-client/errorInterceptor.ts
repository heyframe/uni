import type {ApiError} from "@/api-client/ApiError";
import {ApiClientError} from "@/api-client/ApiError";

export function errorInterceptor<T extends { errors: Array<ApiError> }>(
    response: UniApp.RequestSuccessCallbackResult | UniApp.GeneralCallbackResult
): never {
    // uni.request 成功响应（有 statusCode）
    if ("statusCode" in response) {
        throw new ApiClientError<T>({
            response,
            _data: response.data,
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode,
            statusText: response.errMsg,
            headers: response.header || {},
            url: "",
        } as any);
    } else {
        throw new Error(response.errMsg || "Network request failed");
    }
}
