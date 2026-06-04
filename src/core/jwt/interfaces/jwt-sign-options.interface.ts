import type { JwtAlgorithm } from '../constants/jwt-algorithm.constant';

export interface JwtCoreSignOptions {
  privateKey: string;
  expiresIn: number;
  kid: string;
  algorithm?: JwtAlgorithm;
}
