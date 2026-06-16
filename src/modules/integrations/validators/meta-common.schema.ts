import z from 'zod';

export const metaUserSchema = z.object({
  id: z.string().min(1),
});

export type MetaUser = z.infer<typeof metaUserSchema>;

export const metaMessageSchema = z
  .object({
    mid: z.string().optional(),
    text: z.string().optional(),
    attachments: z.array(z.unknown()).optional(),
    quick_reply: z
      .object({
        payload: z.string(),
      })
      .optional(),
  })
  .passthrough();

export type MetaMessage = z.infer<typeof metaMessageSchema>;

export const metaDeliverySchema = z
  .object({
    mids: z.array(z.string()).optional(),
    watermark: z.number().optional(),
    seq: z.number().optional(),
  })
  .passthrough();

export type MetaDelivery = z.infer<typeof metaDeliverySchema>;

export const metaPostbackSchema = z
  .object({
    title: z.string().optional(),
    payload: z.string().optional(),
  })
  .passthrough();

export type MetaPostback = z.infer<typeof metaPostbackSchema>;

export const metaReadSchema = z
  .object({
    watermark: z.number().optional(),
    seq: z.number().optional(),
  })
  .passthrough();

export type MetaRead = z.infer<typeof metaReadSchema>;
