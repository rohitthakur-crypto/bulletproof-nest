import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export class UserIdParamDto extends createZodDto(userIdParamSchema) {}
