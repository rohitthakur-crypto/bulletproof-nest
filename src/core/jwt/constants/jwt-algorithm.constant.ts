import type { Algorithm } from 'jsonwebtoken';

export const JWT_ALGORITHM = 'RS256' as const satisfies Algorithm;

export type JwtAlgorithm = typeof JWT_ALGORITHM;

export const JWT_TOKEN_CONFIG = {
  algorithm: JWT_ALGORITHM,
  algorithms: [JWT_ALGORITHM] as Algorithm[],
} as const;
