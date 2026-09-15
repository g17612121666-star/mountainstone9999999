/**
 * Safe headers only. MUST NOT set X-Frame-Options or CSP frame-ancestors:
 * the live preview is an iframe on grok.com.
 */
const HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function apply(event: unknown) {
  const e = event as {
    node?: { res?: { setHeader?: (k: string, v: string) => void } };
    res?: { setHeader?: (k: string, v: string) => void };
  };
  for (const [k, v] of Object.entries(HEADERS)) {
    e.node?.res?.setHeader?.(k, v);
    e.res?.setHeader?.(k, v);
  }
}

export default async function securityHeaders(
  event: unknown,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  try {
    apply(event);
  } catch {
    /* never block the response */
  }
  return next();
}
