/**
 * Origin and Frontend URL resolution for VOID/ROSE API.
 * Supports custom domain (voidrose.reternia.com), Cloudflare Pages (void-rose-merch.pages.dev),
 * preview environments, and local development.
 */

export function isAllowedOrigin(origin: string | undefined | null, envAppUrl?: string): boolean {
  // Allow non-browser requests (server-to-server, curl, webhooks, Postman)
  if (!origin) return true;

  const clean = origin.trim().replace(/\/+$/, '');

  try {
    const urlStr = clean.startsWith('http://') || clean.startsWith('https://')
      ? clean
      : `https://${clean}`;
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();

    // 1. Localhost and 127.0.0.1 for local dev (any port)
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }

    // 2. Custom domain: voidrose.reternia.com and *.reternia.com
    if (host === 'voidrose.reternia.com' || host === 'reternia.com' || host.endsWith('.reternia.com')) {
      return true;
    }

    // 3. Cloudflare Pages default domain and preview deployments (*.pages.dev)
    if (
      host === 'void-rose-merch.pages.dev' ||
      host.endsWith('.void-rose-merch.pages.dev') ||
      host.endsWith('.pages.dev')
    ) {
      return true;
    }

    // 4. Custom configured APP_URL in environment if provided
    if (envAppUrl) {
      try {
        const appUrlClean = envAppUrl.trim().replace(/\/+$/, '');
        const appParsed = new URL(
          appUrlClean.startsWith('http') ? appUrlClean : `https://${appUrlClean}`
        );
        if (host === appParsed.hostname.toLowerCase()) {
          return true;
        }
      } catch {
        // ignore invalid env URL
      }
    }
  } catch {
    // Fallback string matching if URL parsing fails on unusual inputs
    const lower = clean.toLowerCase();
    if (
      lower.includes('voidrose.reternia.com') ||
      lower.includes('void-rose-merch.pages.dev') ||
      lower.includes('localhost') ||
      lower.includes('127.0.0.1')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the CORS origin header value to return in Access-Control-Allow-Origin.
 * Returns null when the origin is not allowed, blocking cross-origin access.
 */
export function getCorsOrigin(origin: string | undefined | null, envAppUrl?: string): string | null {
  if (!origin) return '*';
  if (isAllowedOrigin(origin, envAppUrl)) {
    return origin;
  }
  return null;
}

/**
 * Resolves the frontend base URL dynamically from the incoming request.
 * Useful for building order tracking links and transactional email URLs that match
 * the user's current browsing domain (voidrose.reternia.com vs void-rose-merch.pages.dev).
 */
export function getFrontendBaseUrl(c: {
  req: { header: (name: string) => string | undefined };
  env?: { APP_URL?: string };
}): string {
  const origin = c.req.header('origin') || c.req.header('referer');
  if (origin) {
    try {
      const clean = origin.trim().replace(/\/+$/, '');
      const urlStr = clean.startsWith('http://') || clean.startsWith('https://')
        ? clean
        : `https://${clean}`;
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();

      // Check if it's one of our recognized frontend origins
      if (
        host === 'voidrose.reternia.com' ||
        host.endsWith('.reternia.com') ||
        host === 'void-rose-merch.pages.dev' ||
        host.endsWith('.pages.dev') ||
        host === 'localhost' ||
        host === '127.0.0.1'
      ) {
        return `${url.protocol}//${url.host}`;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to configured APP_URL or default to custom domain
  if (c.env?.APP_URL) {
    return c.env.APP_URL.trim().replace(/\/+$/, '');
  }

  return 'https://voidrose.reternia.com';
}
