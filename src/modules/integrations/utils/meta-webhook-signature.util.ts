import crypto from 'crypto';

import { META_WEBHOOK_SIGNATURE_HEADER } from '../constants';

/**
 * Verifies the X-Hub-Signature-256 HMAC signature on an incoming Meta webhook request.
 * The raw body Buffer is required — JSON.stringify round-trips will break the hash.
 *
 * @see https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads
 */
export function verifyMetaWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const prefix = 'sha256=';

  if (!signatureHeader.startsWith(prefix)) {
    return false;
  }

  const receivedHex = signatureHeader.slice(prefix.length);
  const expectedHex = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(receivedHex), Buffer.from(expectedHex));
}

export const META_SIGNATURE_HEADER_NAME = META_WEBHOOK_SIGNATURE_HEADER;
