import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import {
  metaUserSchema,
  metaMessageSchema,
  metaPostbackSchema,
  metaDeliverySchema,
  metaReadSchema,
} from './meta-common.schema';

export const metaMessagingEventSchema = z
  .object({
    sender: metaUserSchema.optional(),
    recipient: metaUserSchema.optional(),
    timestamp: z.number().optional(),

    message: metaMessageSchema.optional(),
    postback: metaPostbackSchema.optional(),
    delivery: metaDeliverySchema.optional(),
    read: metaReadSchema.optional(),
  })
  .passthrough();

export type MetaMessagingEvent = z.infer<typeof metaMessagingEventSchema>;

export class MetaMessagingEventDto extends createZodDto(metaMessagingEventSchema) {}
