import { describe, it, expect } from 'vitest';
import { clientEnv } from '@/lib/env';

describe('Environment Configuration', () => {
  it('should have default API URL', () => {
    expect(clientEnv.NEXT_PUBLIC_API_URL).toBe('https://erp.azteamtech.com');
  });

  it('should have default store name', () => {
    expect(clientEnv.NEXT_PUBLIC_STORE_NAME).toBe('AZTEAM Custom Apparel');
  });

  it('should have valid default locale', () => {
    expect(['en', 'pt']).toContain(clientEnv.NEXT_PUBLIC_DEFAULT_LOCALE);
  });
});
