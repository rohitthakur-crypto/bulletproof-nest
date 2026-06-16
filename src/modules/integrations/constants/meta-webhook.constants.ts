export const META_WEBHOOK_SIGNATURE_HEADER = 'x-hub-signature-256' as const;

export const META_WEBHOOK_ACK_RESPONSE = 'EVENT_RECEIVED' as const;

export type MetaWebhookAckResponse = typeof META_WEBHOOK_ACK_RESPONSE;
