import type { AxiosRequestConfig, ResponseType } from 'axios';

import type { HttpMethod } from '@/common/enums';

export interface HttpRequestAuth {
  readonly username: string;
  readonly password: string;
}

export interface HttpRequestOptions<TBody = unknown> {
  readonly url: string;
  readonly method?: HttpMethod;
  readonly baseURL?: string;
  readonly params?: Record<string, unknown>;
  readonly data?: TBody;
  readonly headers?: Record<string, string>;
  readonly timeout?: number;
  readonly auth?: HttpRequestAuth;
  readonly responseType?: ResponseType;
  readonly axiosConfig?: Omit<
    AxiosRequestConfig,
    | 'url'
    | 'method'
    | 'baseURL'
    | 'params'
    | 'data'
    | 'headers'
    | 'timeout'
    | 'auth'
    | 'responseType'
  >;
}
