import type { JwtAlgorithm } from '../constants/jwt-algorithm.constant';

export interface JwtCoreVerifyOptions {
  publicKey: string;
  algorithms?: JwtAlgorithm[];
}
