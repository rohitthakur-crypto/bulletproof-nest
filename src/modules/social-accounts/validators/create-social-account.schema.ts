import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createSocialAccountSchema = z
  .object({
    pageId: z.string().min(1),
    connectInstagram: z.boolean().default(false),
    connectFacebook: z.boolean().default(true),
  })
  .refine((selection) => selection.connectFacebook || selection.connectInstagram, {
    message: 'Connect at least Facebook or Instagram',
  });

export const createSocialAccountsSchema = z
  .array(createSocialAccountSchema)
  .min(1, 'At least one account must be selected')
  .superRefine((selections, ctx) => {
    const pageIds = selections.map((selection) => selection.pageId);
    const uniquePageIds = new Set(pageIds);

    if (uniquePageIds.size !== pageIds.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Duplicate pageId in request',
      });
    }
  });

export type CreateSocialAccountType = z.infer<typeof createSocialAccountSchema>;
export class CreateSocialAccountDto extends createZodDto(createSocialAccountSchema) {}

export type CreateSocialAccountsType = z.infer<typeof createSocialAccountsSchema>;
export class CreateSocialAccountsDto extends createZodDto(createSocialAccountsSchema) {}
