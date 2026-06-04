import type { BuildErrorInput } from '../envelope/error.builder';
import type { RequestContext } from '../http/request-context';

export interface ExceptionMapper {
  supports(exception: unknown): boolean;
  map(exception: unknown, ctx: RequestContext, isProduction: boolean): BuildErrorInput;
}
