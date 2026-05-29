import { SetMetadata } from '@nestjs/common';

export const API_SUCCESS_MESSAGE_KEY = 'apiSuccessMessage';

/**
 * Sets the human-readable message on successful API responses.
 *
 * @example
 * @ApiSuccessMessage('User fetched successfully')
 * @Get(':id')
 * findOne() { ... }
 */
export const ApiSuccessMessage = (message: string) =>
  SetMetadata(API_SUCCESS_MESSAGE_KEY, message);
