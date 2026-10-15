import { describe, it, expect } from 'vitest';
import { isAllowedOrigin, getCorsOrigin, getFrontendBaseUrl } from '../apps/api/src/lib/origin.js';
import app from '../apps/api/src/index.js';

describe('CORS and Origin Domain Resolution', () => {
  describe('isAllowedOrigin', () => {
    it('allows custom domain voidrose.reternia.com (https and http)', () => {
      expect(isAllowedOrigin('https://voidrose.reternia.com')).toBe(true);
      expect(isAllowedOrigin('http://voidrose.reternia.com')).toBe(true);
      expect(isAllowedOrigin('https://voidrose.reternia.com/')).toBe(true);
      expect(isAllowedOrigin('voidrose.reternia.com')).toBe(true);
      expect(isAllowedOrigin('https://subdomain.reternia.com')).toBe(true);
    });

    it('allows Cloudflare Pages domain void-rose-merch.pages.dev', () => {
      expect(isAllowedOrigin('https://void-rose-merch.pages.dev')).toBe(true);
      expect(isAllowedOrigin('https://void-rose-merch.pages.dev/')).toBe(true);
      expect(isAllowedOrigin('http://void-rose-merch.pages.dev')).toBe(true);
      expect(isAllowedOrigin('https://preview-1.void-rose-merch.pages.dev')).toBe(true);
    });

    it('allows local development origins', () => {
      expect(isAllowedOrigin('http://localhost:5173')).toBe(true);
      expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
      expect(isAllowedOrigin('http://127.0.0.1:8787')).toBe(true);
    });

    it('allows server-to-server and webhook calls without origin', () => {
      expect(isAllowedOrigin(undefined)).toBe(true);
      expect(isAllowedOrigin(null)).toBe(true);
      expect(isAllowedOrigin('')).toBe(true);
    });

    it('rejects unauthorized third-party origins', () => {
      expect(isAllowedOrigin('https://evil-phishing.com')).toBe(false);
      expect(isAllowedOrigin('https://voidrose.reternia.com.attacker.com')).toBe(false);
      expect(isAllowedOrigin('https://fake-void-rose-merch.pages.dev.phish.io')).toBe(false);
    });
  });

  describe('getCorsOrigin', () => {
    it('returns exact origin string for allowed frontend origins', () => {
      expect(getCorsOrigin('https://voidrose.reternia.com')).toBe('https://voidrose.reternia.com');
      expect(getCorsOrigin('https://void-rose-merch.pages.dev')).toBe('https://void-rose-merch.pages.dev');
      expect(getCorsOrigin('http://localhost:5173')).toBe('http://localhost:5173');
    });

    it('returns null for rejected origins to prevent unauthorized browser access', () => {
      expect(getCorsOrigin('https://malicious-site.com')).toBeNull();
    });

    it('returns * when origin is missing (server-to-server)', () => {
      expect(getCorsOrigin(undefined)).toBe('*');
    });
  });

  describe('getFrontendBaseUrl', () => {
    it('dynamically resolves to voidrose.reternia.com when origin matches custom domain', () => {
      const mockContext = {
        req: {
          header: (name: string) => {
            if (name.toLowerCase() === 'origin') return 'https://voidrose.reternia.com';
            return undefined;
          }
        },
        env: { APP_URL: 'https://voidrose.reternia.com' }
      };
      expect(getFrontendBaseUrl(mockContext)).toBe('https://voidrose.reternia.com');
    });

    it('dynamically resolves to void-rose-merch.pages.dev when origin matches pages.dev', () => {
      const mockContext = {
        req: {
          header: (name: string) => {
            if (name.toLowerCase() === 'origin') return 'https://void-rose-merch.pages.dev';
            return undefined;
          }
        },
        env: { APP_URL: 'https://voidrose.reternia.com' }
      };
      expect(getFrontendBaseUrl(mockContext)).toBe('https://void-rose-merch.pages.dev');
    });

    it('dynamically resolves to localhost when testing locally', () => {
      const mockContext = {
        req: {
          header: (name: string) => {
            if (name.toLowerCase() === 'origin') return 'http://localhost:5173';
            return undefined;
          }
        },
        env: { APP_URL: 'https://voidrose.reternia.com' }
      };
      expect(getFrontendBaseUrl(mockContext)).toBe('http://localhost:5173');
    });

    it('falls back to APP_URL when origin and referer are absent (e.g. background job)', () => {
      const mockContext = {
        req: {
          header: () => undefined
        },
        env: { APP_URL: 'https://voidrose.reternia.com' }
      };
      expect(getFrontendBaseUrl(mockContext)).toBe('https://voidrose.reternia.com');
    });
  });

  describe('Hono App CORS Middleware Preflight', () => {
    it('responds with 204 and CORS headers for voidrose.reternia.com', async () => {
      const res = await app.request('/api/health', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://voidrose.reternia.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://voidrose.reternia.com');
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('responds with 204 and CORS headers for void-rose-merch.pages.dev', async () => {
      const res = await app.request('/api/health', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://void-rose-merch.pages.dev',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://void-rose-merch.pages.dev');
      expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });

    it('does not allow unauthorized origins in preflight', async () => {
      const res = await app.request('/api/health', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://attacker-domain.com',
          'Access-Control-Request-Method': 'GET'
        }
      });
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });
  });
});
