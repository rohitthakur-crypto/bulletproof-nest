import ms, { type StringValue } from 'ms';

export const toSeconds = (duration: StringValue): number => Math.floor(ms(duration) / 1000);

export const toDate = (duration: StringValue, from = new Date()): Date =>
  new Date(from.getTime() + ms(duration));

export const isExpired = (expiresAt: Date): boolean => expiresAt <= new Date();

export const toIsoString = (value: Date | string | null | undefined): string | undefined => {
  if (value == null) return undefined;
  return value instanceof Date ? value.toISOString() : value;
};
