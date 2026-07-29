# Footloose Alley Studio Manager v3.11.4

## Dependency security maintenance

- Updated the development-only `shadcn` CLI from 4.15.0 to 4.16.0 and moved it from production dependencies to development dependencies.
- Added targeted Next.js overrides for PostCSS 8.5.23 and Sharp 0.35.3, replacing the vulnerable versions declared by Next.js 16.2.12 without changing Next.js itself.
- Regenerated the npm lockfile and verified that the production dependency audit reports zero vulnerabilities.

## Preserved behavior

- Next.js remains pinned to exactly 16.2.12.
- Application features, receipt printing, security headers, Supabase configuration, and database/RLS behavior are unchanged.
- No SQL migration is required.
