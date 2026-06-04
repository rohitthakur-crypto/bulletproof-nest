import { JwtHeader } from 'jsonwebtoken';

import type { JwtAlgorithm } from '../constants/jwt-algorithm.constant';

export interface JwtCoreSignOptions {
  privateKey: string;
  expiresIn: number;
  algorithm?: JwtAlgorithm;
  header?: JwtHeader;
}
