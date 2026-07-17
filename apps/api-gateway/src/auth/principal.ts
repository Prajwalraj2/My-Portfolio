// The normalized identity resolved from ANY credential type (session/api-key/admin-jwt).
// Every downstream guard and handler reads this instead of caring how the caller authed.

export type PrincipalKind = 'user' | 'admin' | 'apikey';

export interface Principal {
  kind: PrincipalKind;
  id: string; // user id, admin id, or api-key id
  userId?: string; // the owning user (same as id for 'user', key owner for 'apikey')
  email?: string;
  role?: string;
  scopes: string[]; // populated for 'apikey'; empty for user/admin (full access)
  rateLimitPerHour?: number; // set for 'apikey' — per-key hourly budget
}

// Shape returned by an OAuth provider after we fetch the user's profile.
export interface OAuthProfile {
  providerUserId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}
