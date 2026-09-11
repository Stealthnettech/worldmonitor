/**
 * Self-hosted mode (StealthNet fork). Hides SaaS-only chrome — Clerk auth,
 * Pro billing/paywalls, community widget — and unlocks every panel locally.
 * Defaults ON in this fork; build with VITE_SELF_HOSTED=0 for upstream behaviour.
 */
export const SELF_HOSTED: boolean = (import.meta.env.VITE_SELF_HOSTED ?? '1') !== '0';


/**
 * Behind an identity-aware proxy (Cloudflare Access), upstream's CDN-shielded
 * "public tier" fetches use credentials:'omit', which strips the proxy's auth
 * cookie and gets the request rejected before it reaches the origin. In
 * self-hosted mode every same-origin request keeps its cookies.
 */
export function installSelfHostedFetch(): void {
  if (!SELF_HOSTED || typeof window === 'undefined' || typeof globalThis.fetch !== 'function') return;
  const w = window as unknown as { __wmSelfHostedFetch?: boolean };
  if (w.__wmSelfHostedFetch) return;
  w.__wmSelfHostedFetch = true;
  const orig = globalThis.fetch.bind(globalThis);
  const origin = window.location.origin;
  const isSameOrigin = (u: string): boolean => u.startsWith('/') || u.startsWith(origin);
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (isSameOrigin(url)) {
        if (init?.credentials === 'omit') init = { ...init, credentials: 'same-origin' };
        else if (!init && input instanceof Request && input.credentials === 'omit') {
          input = new Request(input, { credentials: 'same-origin' });
        }
      }
    } catch { /* never break fetch over a URL parse */ }
    return orig(input, init);
  }) as typeof fetch;
}
