import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const ConnectableInstagramAssetResponseSchema = z.object({
  available: z.boolean(),
  id: z.string().optional(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
});

const connectableAssetResponseSchema = z.object({
  id: z.string(), // Facebook Page ID
  name: z.string(),
  picture: z.string(),
  instagram: ConnectableInstagramAssetResponseSchema,
});

export type ConnectableAssetResponse = z.infer<typeof connectableAssetResponseSchema>;

export class ConnectableAssetResponseDto extends createZodDto(connectableAssetResponseSchema) {}
