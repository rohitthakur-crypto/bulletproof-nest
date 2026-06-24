import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, type AxiosInstance } from 'axios';

import type { RequestOptionsWithoutMethod } from './http.types';
import type { HttpRequestOptions } from './interfaces';

import { HTTP_STATUS_OK_MAX_EXCLUSIVE, HTTP_STATUS_OK_MIN } from '@/common/constants';
import { HttpMethod } from '@/common/enums';
import { AppConfigService } from '@/core/config/services/app-config.service';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly config: AppConfigService) {
    this.client = axios.create({
      timeout: this.config.app.requestTimeoutMs,
      validateStatus: (status) =>
        status >= HTTP_STATUS_OK_MIN && status < HTTP_STATUS_OK_MAX_EXCLUSIVE,
    });
  }

  async request<TResponse, TBody = unknown>(
    options: HttpRequestOptions<TBody>,
  ): Promise<TResponse> {
    try {
      const { data } = await this.client.request<TResponse>({
        url: options.url,
        method: options.method ?? HttpMethod.GET,
        baseURL: options.baseURL,
        params: options.params,
        data: options.data,
        headers: options.headers,
        timeout: options.timeout ?? this.config.app.requestTimeoutMs,
        auth: options.auth,
        responseType: options.responseType,
        ...options.axiosConfig,
      });

      return data;
    } catch (error) {
      this.logRequestError(error, options);
      throw error;
    }
  }

  get<TResponse>(url: string, options?: RequestOptionsWithoutMethod<never>): Promise<TResponse> {
    return this.request<TResponse>({ ...options, url, method: HttpMethod.GET });
  }

  post<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptionsWithoutMethod<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: HttpMethod.POST,
      data: body,
    });
  }

  put<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptionsWithoutMethod<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: HttpMethod.PUT,
      data: body,
    });
  }

  patch<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    options?: RequestOptionsWithoutMethod<TBody>,
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: HttpMethod.PATCH,
      data: body,
    });
  }

  delete<TResponse>(url: string, options?: RequestOptionsWithoutMethod<never>): Promise<TResponse> {
    return this.request<TResponse>({ ...options, url, method: HttpMethod.DELETE });
  }

  private logRequestError(error: unknown, options: HttpRequestOptions): void {
    if (!(error instanceof AxiosError)) {
      return;
    }
    this.logger.error('External HTTP request failed', {
      url: options.url,
      method: options.method ?? HttpMethod.GET,
      baseURL: options.baseURL,
      status: error.response?.status,
      responseData: error.response?.data as unknown,
    });
  }
}
