/**
 * Self-hosted mode (StealthNet fork). Hides SaaS-only chrome — Clerk auth,
 * Pro billing/paywalls, community widget — and unlocks every panel locally.
 * Defaults ON in this fork; build with VITE_SELF_HOSTED=0 for upstream behaviour.
 */
export const SELF_HOSTED: boolean = (import.meta.env.VITE_SELF_HOSTED ?? '1') !== '0';
