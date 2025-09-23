export type ApiError = {
    title?: string;
    detail?: string;
    code?: string;
    status?: string;
    source?: {
        pointer?: string;
    };
    meta?: {
        parameters?: Record<string, string> | [];
    };
};

export class ApiClientError<
    T extends { errors: Array<ApiError> },
> extends Error {
    /**
     * Flag to indicate if the request was successful.
     */
    public ok: boolean;
    /**
     * HTTP status code of the response.
     */
    public status: number;
    /**
     * HTTP status text of the response.
     */
    public statusText?: string;
    /**
     * URL of the request.
     */
    public url?: string;
    /**
     * Details of the error.
     */
    public details: T;
    /**
     * Headers of the response.
     */
    public headers: Record<string, string>;

    constructor(response: UniApp.RequestSuccessCallbackResult) {
        let message = "Failed request";

        const errorDetails =
            (response.data as T) ||
            ({
                errors: [
                    {
                        title: "Unknown error",
                        detail:
                            "API did not return errors, but request failed. Please check the network tab.",
                    },
                ],
            } as T);

        message +=
            errorDetails.errors?.reduce((message, error) => {
                let pointer = "";
                if (error.source?.pointer) {
                    pointer = `[${error.source.pointer}]`;
                }
                const details = error.detail ?? "No error details provided.";
                return `${message}\n - [${error.title}]${pointer} ${details}`;
            }, "") ?? "";
        super(message);

        this.name = "ApiClientError";
        this.details = errorDetails;
        this.ok = response.statusCode >= 200 && response.statusCode < 300;
        this.status = response.statusCode;
        this.statusText = this.ok ? "OK" : "Error";
        this.headers = response.header || {};
    }
}
