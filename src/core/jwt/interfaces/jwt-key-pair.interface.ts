import type { JwtKid } from '../constants/jwt-kids.constant';

export interface JwtKeyPair {
  privateKey: string;
  publicKey: string;
  kid: JwtKid;
  expiresIn: string;
}
