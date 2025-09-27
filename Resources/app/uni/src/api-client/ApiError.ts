import {type UnHeaders, type UnResponse} from "@uni-helper/uni-network";

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
   * HTTP status code of the response.
   */
  public status: number | undefined;
  /**
   * HTTP status text of the response.
   */
  public statusText?: string;
  /**
   * URL of the request.
   */
  public url: string | undefined;
  /**
   * Details of the error.
   */
  public details: T;
  /**
   * Headers of the response.
   */
  public headers: UnHeaders|undefined;

  constructor(response: UnResponse<T>) {
    let message = "Failed request";

    const errorDetails =
      response.data ||
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
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.config?.url;
    this.headers = response.headers;
  }
}

