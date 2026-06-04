export const JWT_KIDS = {
  USER_ACCESS: 'user-access-v1',
  USER_REFRESH: 'user-refresh-v1',
  USER_PASSWORD_RESET: 'user-password-reset-v1',
  USER_EMAIL_VERIFICATION: 'user-email-verification-v1',

  ADMIN_ACCESS: 'admin-access-v1',
  ADMIN_REFRESH: 'admin-refresh-v1',
  ADMIN_PASSWORD_RESET: 'admin-password-reset-v1',
  ADMIN_EMAIL_VERIFICATION: 'admin-email-verification-v1',
} as const;

export type JwtKid = (typeof JWT_KIDS)[keyof typeof JWT_KIDS];
