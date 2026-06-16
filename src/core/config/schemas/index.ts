import { z } from 'zod';

import { appEnvSchema } from './app.env.schema';
import { databaseEnvSchema } from './database.env.schema';
import { firebaseEnvSchema } from './firebase.env.schema';
import { jwtEnvSchema } from './jwt.env.schema';
import { loggerEnvSchema } from './logger.env.schema';
import { metaEnvSchema } from './meta.env.schema';
import { queueEnvSchema } from './queue.env.schema';
import { redisEnvSchema } from './redis.env.schema';
import { securityEnvSchema } from './security.env.schema';

export const envSchema = z.object({
  ...appEnvSchema.shape,
  ...databaseEnvSchema.shape,
  ...jwtEnvSchema.shape,
  ...redisEnvSchema.shape,
  ...firebaseEnvSchema.shape,
  ...queueEnvSchema.shape,
  ...loggerEnvSchema.shape,
  ...metaEnvSchema.shape,
  ...securityEnvSchema.shape,
});

export type Env = z.infer<typeof envSchema>;
