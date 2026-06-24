import { MetaMessageType } from '../enums';

export interface MetaDmRecipient {
  id: string;
}

export interface MetaDmMessage {
  text: string;
}
export interface MetaDmRequest {
  recipient: MetaDmRecipient;
  message: MetaDmMessage;
  messaging_type: MetaMessageType;
}

export interface MetaDmResponse {
  recipient_id: string;
  message_id: string;
}

export interface MetaDmPrivateReplyRequest {
  message: string;
}

export interface MetaDmPrivateReplyResponse {
  id: string;
}
