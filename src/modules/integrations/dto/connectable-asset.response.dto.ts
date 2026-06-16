import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const connectableInstagramSchema = z.object({
  available: z.boolean(),
  id: z.string().optional(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const connectableAssetResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  picture: z.string(),
  instagram: connectableInstagramSchema,
});

export type ConnectableAssetResponse = z.infer<typeof connectableAssetResponseSchema>;

export class ConnectableAssetResponseDto extends createZodDto(connectableAssetResponseSchema) {}
