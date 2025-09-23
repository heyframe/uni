import HeyUni from "@/heyuni-instance";

export type BasicHeaders = {
  Accept: string;
  'sw-context-token'?: string | null;
  'sw-language-id'?: string | null;
  'Content-Type': string;
  [key: string]: string | null | undefined;
};

/**
 * ApiService class which provides the common methods for our REST API
 * @class
 */
class ApiService {
  client: $TSFixMe;
  type = 'application/vnd.api+json';

  constructor(
    httpClient: $TSFixMe,
    contentType = 'application/vnd.api+json',
  ) {
    this.httpClient = httpClient;
  }

  /**
   * Get the basic headers for a request.
   */
  getBasicHeaders(additionalHeaders = {}): BasicHeaders {
    const basicHeaders = {
      Accept: this.contentType,
      'Content-Type': 'application/json',
    };

    return {...basicHeaders, ...additionalHeaders};
  }

  /**
   * Get the headers for an authenticated request (after login).
   */
  getAuthHeaders(additionalHeaders = {}): BasicHeaders {

    const authHeaders: BasicHeaders = {
      Accept: this.contentType,
      'Content-Type': 'application/json',
    };

    return {...authHeaders, ...additionalHeaders};
  }

  static makeQueryParams(paramDictionary = {} as { [key: string]: string | number }): string {
    const params = Object.keys(paramDictionary)
      .filter((key) => typeof paramDictionary[key] === 'string')
      .map((key) => `${key}=${paramDictionary[key]}`);

    if (!params.length) {
      return '';
    }

    return `?${params.join('&')}`;
  }

  /**
   * Getter for the http client
   */
  get httpClient(): $TSFixMe {
    return this.client;
  }

  /**
   * Setter for the http client
   */
  set httpClient(client: $TSFixMe) {
    this.client = client;
  }

  get contentType(): string {
    return this.type;
  }

  set contentType(contentType) {
    this.type = contentType;
  }
}

export default ApiService;
