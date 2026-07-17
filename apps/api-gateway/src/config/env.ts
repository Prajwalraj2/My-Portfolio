import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // AI Service
  AI_SERVICE_URL: z.string().default('http://127.0.0.1:8001'),
  
  // JWT
  JWT_SECRET: z.string().min(32).default('development-secret-key-min-32-characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-key-min-32-characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),

  // App URLs
  APP_URL: z.string().default('http://localhost:3000'),
  API_GATEWAY_URL: z.string().default('http://localhost:8000'),

  // Sessions / cookies
  COOKIE_SECRET: z.string().min(32).default('development-cookie-secret-min-32-characters'),
  SESSION_EXPIRES_DAYS: z.coerce.number().default(7),

  // OAuth — Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // OAuth — GitHub
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  // Base for OAuth callback URLs. For the BFF flow set this to the frontend proxy, e.g.
  // http://localhost:3000/api/proxy  → callback http://localhost:3000/api/proxy/auth/google/callback
  // Defaults to the gateway's own /api (direct flow).
  OAUTH_REDIRECT_BASE: z.string().optional(),

  // GitHub data (read-only, read:user token)
  GITHUB_USERNAME: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),

  // Cal.com (scheduling)
  CALCOM_API_KEY: z.string().optional(),
  CALCOM_API_BASE: z.string().default('https://api.cal.com/v2'),
  CALCOM_EVENT_TYPE_ID: z.coerce.number().optional(),
  CALCOM_USERNAME: z.string().optional(),
  CALCOM_EVENT_SLUG: z.string().optional(),
  CALCOM_WEBHOOK_TOKEN: z.string().optional(),
  // Optional: force a video integration (e.g. 'google-meet', 'cal-video'). If unset,
  // Cal.com uses the event type's own default location.
  CALCOM_LOCATION_INTEGRATION: z.string().optional(),

  // Notifications
  SLACK_WEBHOOK_URL: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
  PRAJWAL_NOTIFY_EMAIL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
