# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Workers project that implements a URL forwarding service similar to fwd.host by the Laravel Herd team. The service redirects GET requests to .test domains, making it useful for OAuth callbacks during local development when social authentication providers require public domains.

## Development Commands

- `npm run dev` - Start local development server (runs on localhost:8787)
- `npm run start` - Alias for dev command
- `npm run test` - Run tests using Vitest with Cloudflare Workers pool
- `npm run deploy` - Deploy worker to Cloudflare
- `npm run cf-typegen` - Generate TypeScript types for Cloudflare bindings

## Service Functionality

**URL Format Support:**
- With protocol: `https://your-domain.com/https://app.test/callback`
- Without protocol: `https://your-domain.com/app.test/callback` (defaults to HTTP)
- Query parameters are preserved in redirects

**Security:**
- Only allows redirects to `.test` domains
- Returns 403 for any non-.test domain attempts

## Architecture

### Core Functions (`src/index.ts`)
- **extractTargetUrl()** - Extracts target URL from path, defaults to HTTP if no protocol specified
- **isValidTestDomain()** - Validates that target URL uses .test domain
- **buildRedirectUrl()** - Constructs final redirect URL preserving query parameters
- **fetch handler** - Main worker logic returning 302 redirects

### Testing Setup
- **Framework**: Vitest with `@cloudflare/vitest-pool-workers` for Worker-specific testing
- **Test Coverage**: URL parsing, protocol handling, .test domain validation, redirect functionality
- **Test Config**: `vitest.config.mts` configured to use Wrangler configuration

### Configuration Files
- **Wrangler**: `wrangler.jsonc` - Cloudflare Workers deployment configuration
- **TypeScript**: Standard strict TypeScript configuration with Workers-specific types
- **Test TypeScript**: Separate `test/tsconfig.json` extending main config with test types

## Key Development Patterns

### URL Processing Flow
1. Extract target URL from pathname (after first `/`)
2. Add `http://` prefix if no protocol specified
3. Validate target is a `.test` domain
4. Build redirect URL preserving query parameters
5. Return 302 redirect response

### Testing Approach
- Test both explicit and implicit protocol scenarios
- Verify query parameter preservation
- Test security restrictions for non-.test domains
- Use `IncomingRequest` type for proper Cloudflare Workers testing