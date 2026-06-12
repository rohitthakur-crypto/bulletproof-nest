import { z } from 'zod';

export const envBool = (def = false) =>
  z
    .string()
    .optional()
    .default(def ? 'true' : 'false')
    .transform((v) => v === 'true' || v === '1');
