---
status: accepted
---

# Use Next.js, Vercel, and durable signal snapshots

The site will use Next.js App Router and TypeScript on Vercel, with pre-rendered content, focused interaction islands, repository-owned MDX and typed data, and a protected daily refresh that writes validated last-known-good integration snapshots to Vercel Blob.

This keeps the site on one deployment platform and supports expressive interactions plus external data without making every page a dynamic application. Static export is unsuitable because scheduled route handlers are required, while a CMS, database, or separate Cloudflare scheduler would add operational complexity before it provides enough value.

Vercel Hobby and daily freshness are sufficient for launch. Each source must fail independently, retain its previous successful value, and fall back to bundled content without exposing credentials, raw errors, private repository identities, or other people's fantasy-league identities.
