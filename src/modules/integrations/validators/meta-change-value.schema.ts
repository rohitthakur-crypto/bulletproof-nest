import z from 'zod';

export const metaChangeValueSchema = z
  .object({
    messaging_product: z.string().optional(),

    messages: z
      .array(
        z
          .object({
            id: z.string(),
            from: z.string(),
            timestamp: z.string(),

            text: z
              .object({
                body: z.string(),
              })
              .optional(),
          })
          .passthrough(),
      )
      .optional(),

    statuses: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type MetaChangeValue = z.infer<typeof metaChangeValueSchema>;
