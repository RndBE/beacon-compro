// Animated, client-only dashboard — no SSR avoids hydration mismatch from
// time/random-driven widgets. Server load functions (auth guard) still run.
export const ssr = false;
