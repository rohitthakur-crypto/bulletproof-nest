/**
 * Payload pushed to the `automation-action` queue when a `send_message` node
 * needs to deliver a direct message independently of the main workflow runner.
 *
 * This queue is used for deferred / standalone DM actions. The full automation
 * workflow (COMMENT_KEYWORD → SendMessageHandler) runs inline in the worker;
 * this queue handles cases where a DM is triggered directly (e.g. manual send,
 * retry, or future scheduled messages).
 */
export interface SendDmJob {
  /** AutomationExecution ID for tracking */
  executionId: string;

  /** Automation ID that initiated this action */
  automationId: string;

  /** Workspace owning this automation */
  workspaceId: string;

  /** SocialAccount (page/IG account) sending the message */
  socialAccountId: string;

  /** Meta user ID of the recipient */
  recipientId: string;

  /** Message text to send */
  message: string;

  /** Platform the message will be sent on */
  platform: 'INSTAGRAM' | 'FACEBOOK';
}
