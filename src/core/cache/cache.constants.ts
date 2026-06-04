export const CACHE_TTL = {
  MINUTE: 60,
  FIVE_MIN: 300,
  THIRTY_MIN: 1_800,
  HOUR: 3_600,
  DAY: 86_400,
  WEEK: 604_800,
} as const;

export type CacheTtl = (typeof CACHE_TTL)[keyof typeof CACHE_TTL];
