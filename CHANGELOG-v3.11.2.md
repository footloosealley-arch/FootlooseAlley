# Footloose Alley Studio Manager v3.11.2

## Security headers

- Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: off`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, and `Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=()` to all application routes.
- Disabled the default `X-Powered-By` framework disclosure header.
- Preserved the existing Supabase remote image configuration, including public `event-images` support.

## Future hardening

- Content Security Policy (CSP) is intentionally deferred to a separate hardening task. The statically generated Next.js application uses framework inline scripts, so a restrictive policy requires authenticated browser regression testing before it can be introduced safely.
