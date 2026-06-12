import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const metaPageResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string(),
});

export type MetaPageResponse = z.infer<typeof metaPageResponseSchema>;

export class MetaPageResponseDto extends createZodDto(metaPageResponseSchema) {}
