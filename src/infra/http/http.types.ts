import { HttpRequestOptions } from './interfaces';

export type RequestOptionsWithoutMethod<TBody> = Omit<HttpRequestOptions<TBody>, 'method'>;
