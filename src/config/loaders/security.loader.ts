import { registerAs } from '@nestjs/config';

import type { SecurityConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const securityConfig = registerAs('security', (): SecurityConfig => {
  const e = getValidatedEnv();

  return {
    encryptionKey: e.ENCRYPTION_KEY,
  };
});
