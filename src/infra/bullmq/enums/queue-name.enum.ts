/**
 * Single registry of every BullMQ queue name in the app.
 * Domain job modules should reference these values — do not duplicate queue strings.
 */
export enum QueueName {
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  CLEANUP = 'cleanup',

  AUTOMATION_TRIGGER = 'automation-trigger',
  AUTOMATION_EXECUTION = 'automation',
  AUTOMATION_ACTION = 'automation-action',
}
