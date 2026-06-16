import { registerAs } from '@nestjs/config';

import type { FirebaseConfig } from '../interfaces';
import { getValidatedEnv } from '../validation/validate-env';

export const firebaseConfig = registerAs('firebase', (): FirebaseConfig => {
  const e = getValidatedEnv();

  return {
    projectId: e.FIREBASE_PROJECT_ID,
    clientEmail: e.FIREBASE_CLIENT_EMAIL,
    privateKey: e.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
});
