import { z } from 'zod';

/**
 * Environment variable schema validation
 * Validates both client-side (NEXT_PUBLIC_*) and server-side environment variables
 */

// Schema for client-side environment variables (exposed to browser)
const clientEnvSchema = z.object({
  // Use string() instead of url() to allow localhost URLs without port
  NEXT_PUBLIC_API_URL: z.string().min(1),
  NEXT_PUBLIC_STORE_NAME: z.string().default('AZTEAM Custom Apparel'),
  NEXT_PUBLIC_STORE_URL: z.string().optional(),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(['en', 'pt']).default('en'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

// Schema for server-side environment variables (never exposed to browser)
const serverEnvSchema = z.object({
  // ERP API URL for server-side API routes (not subject to NEXT_PUBLIC_ build-time replacement)
  ERP_API_URL: z.string().min(1),
  JWT_COOKIE_NAME: z.string().default('azteam_auth'),
  JWT_COOKIE_SECRET: z.string().min(32).optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Combined schema
const envSchema = clientEnvSchema.merge(serverEnvSchema);

// Type definitions
export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = z.infer<typeof envSchema>;

// Validate and export environment variables
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Client-safe environment variables (can be accessed in browser)
// Note: NEXT_PUBLIC_API_URL must be set in .env or .env.local - no fallback
export const clientEnv: ClientEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
  NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME ?? 'AZTEAM Custom Apparel',
  NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'en' | 'pt') ?? 'en',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};

// Server-only environment variables (only accessible in server components/API routes)
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server');
  }

  return {
    ERP_API_URL: process.env.ERP_API_URL!,
    JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME ?? 'azteam_auth',
    JWT_COOKIE_SECRET: process.env.JWT_COOKIE_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
  };
}

// Export validated env (call this in server startup to validate)
export const env = typeof window === 'undefined' ? validateEnv() : clientEnv;
