import { argon2id } from 'argon2';

export const PASSWORD_HASH_OPTIONS = {
  type: argon2id,

  memoryCost: 65536,

  timeCost: 3,

  parallelism: 1,
} as const;
