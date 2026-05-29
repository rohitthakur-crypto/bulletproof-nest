import { registerAs } from '@nestjs/config';

import { env } from '../validation/validate-env';

export const firebaseConfig = registerAs('firebase', () => {
  const e = env();

  return {
    projectId: e.FIREBASE_PROJECT_ID,

    clientEmail: e.FIREBASE_CLIENT_EMAIL,

    privateKey: e.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  } as const;
});

export type FirebaseConfig = ReturnType<typeof firebaseConfig>;
