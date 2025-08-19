# forward.direct

A simple URL forwarding service for `.test` domains, built on Cloudflare Workers. Similar to [fwd.host][fwd-host] by the
Laravel Herd team, this service helps with OAuth callbacks during local development.

## Why forward.direct?

When developing locally with `.test` domains (like Laravel Herd), OAuth providers often reject callback URLs containing
`.test` domains because they require public top-level domains. forward.direct solves this by acting as a public proxy
that redirects OAuth callbacks to your local development environment.

## But fwd.host Already Exists?

Yes, [fwd.host][fwd-host] by the Laravel Herd team is excellent! However, we created forward.direct to solve a specific
compatibility issue.

**The Problem:** Some OAuth providers (notably Spotify) don't support callback URLs with double protocols like:
```
https://fwd.host/https://myapp.test/auth/callback
```

Spotify's OAuth configuration interface rejects URLs containing `https://` twice, making fwd.host incompatible with
Spotify OAuth integration.

**Our Solution:** forward.direct makes the protocol optional. You can use:
```
https://forward.direct/myapp.test/auth/callback
```

This automatically defaults to HTTP (which is what most local development uses anyway, if not your app will most likely
upgrade the request to HTTPS), avoiding the double protocol issue while maintaining compatibility with all OAuth providers.

**Choose forward.direct when:**
- Working with **Spotify OAuth** or other providers that reject double-protocol URLs
- You prefer **cleaner callback URLs** without double protocols (e.g., `domain.com/app.test/callback` vs `domain.com/https://app.test/callback`)
- You want to **self-host** your own forwarding infrastructure
- You need **custom modifications** or additional features

**Stick with fwd.host when:**
- Working with **standard OAuth providers** (GitHub, Google, Facebook, etc.) that accept double protocols
- You prefer a **hosted solution** without deployment overhead
- You want a **battle-tested service** used by thousands of Laravel developers


## Features

- **Secure** - Only allows redirects to `.test` domains
- **Fast** - Built on Cloudflare Workers edge network
- **Flexible** - Supports both explicit and implicit protocols
- **Simple** - No data storage, just redirects
- **Open Source** - Deploy your own instance

## Usage

### URL Formats

**With explicit protocol:**
```
https://forward.direct/https://myapp.test/auth/callback
```

**Without protocol (defaults to HTTP):**
```
https://forward.direct/myapp.test/auth/callback
```

### OAuth Provider Setup

Instead of setting your OAuth callback URL to:
```
http://myapp.test/auth/github/callback
```

Set it to:
```
https://forward.direct/myapp.test/auth/github/callback
```

When users complete OAuth authentication, they'll be redirected through your forward.direct service back to your local
development site with all the necessary OAuth parameters preserved.

### Example with Popular OAuth Providers

**GitHub OAuth App:**
- Callback URL: `https://forward.direct/myapp.test/auth/github/callback`
- Redirects to: `http://myapp.test/auth/github/callback?code=...&state=...`

**Google OAuth App:**
- Callback URL: `https://forward.direct/https://myapp.test/auth/google/callback`
- Redirects to: `https://myapp.test/auth/google/callback?code=...&state=...`

**Spotify OAuth App (doesn't support double protocols):**
- Callback URL: `https://forward.direct/myapp.test/auth/spotify/callback`
- Redirects to: `http://myapp.test/auth/spotify/callback?code=...&state=...`

## Installation & Deployment

### Prerequisites

- Node.js 18+
- [Cloudflare account](https://cloudflare.com)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/grey-studio/forward.direct.git forward-direct
   cd forward-direct
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Wrangler:**
   ```bash
   wrangler login
   ```

4. **Update configuration:**
   Edit `wrangler.jsonc` and change the `name` field to your desired worker name:
   ```json
   {
     "name": "your-forward-service",
     "main": "src/index.ts",
     "compatibility_date": "2025-08-19"
   }
   ```

5. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

6. **Set up custom domain (optional):**
   - In Cloudflare Dashboard, go to Workers & Pages
   - Click on your worker
   - Go to Settings > Triggers
   - Add a custom domain

### Development

**Start local development server:**
```bash
npm run dev
```

**Run tests:**
```bash
npm run test
```

**Generate TypeScript types:**
```bash
npm run cf-typegen
```

## Security

forward.direct only allows redirects to domains ending in `.test` for security reasons. This prevents the service from
being used as an open redirect for malicious purposes.

Attempting to redirect to any non-`.test` domain will result in a 403 Forbidden response.

## API Reference

### Endpoints

**GET /**

Redirects to the project's GitHub repository.

**Responses:**
- `302 Found` - Redirects to `https://github.com/grey-studio/forward.direct`

**GET /{targetUrl}**

Redirects to the specified target URL if it's a valid `.test` domain.

**Parameters:**
- `targetUrl` - The target URL to redirect to, with optional protocol (defaults to HTTP if not specified)

**Responses:**
- `302 Found` - Successful redirect with `Location` header
- `403 Forbidden` - Target URL is not a `.test` domain

**Examples:**
```bash
# Root path redirects to GitHub
curl -i https://forward.direct/

# Redirect with explicit protocol
curl -i https://forward.direct/https://app.test/callback

# Redirect with implicit protocol (defaults to HTTP)
curl -i https://forward.direct/app.test/callback

# With query parameters
curl -i "https://forward.direct/app.test/auth/callback?code=123&state=abc"
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [fwd.host][fwd-host] by the Laravel Herd team
- Built with [Cloudflare Workers](https://workers.cloudflare.com/)

---

**⚠️ Important**: This service is designed specifically for local development with `.test` domains. Do not use it to redirect to production domains or any domains you don't control.

<!-- Link References -->
[fwd-host]: https://herd.laravel.com/docs/macos/advanced-usage/social-auth#using-the-fwd-host-webservice
