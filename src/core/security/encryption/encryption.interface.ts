export interface IEncryptionService {
  encrypt(value: string): string;

  decrypt(value: string): string;
}
