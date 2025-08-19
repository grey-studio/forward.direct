import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Forward Direct worker', () => {
	it('shows usage instructions on root path', async () => {
		const request = new IncomingRequest('https://example.com/');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(400);
		const text = await response.text();
		expect(text).toContain('Forward Direct');
		expect(text).toContain('Usage:');
	});

	it('rejects non-.test domains', async () => {
		const request = new IncomingRequest('https://example.com/https://malicious.com/path');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(403);
		const text = await response.text();
		expect(text).toContain('Only .test domains are allowed');
	});

	it('rejects non-.test domains when no protocol specified', async () => {
		const request = new IncomingRequest('https://example.com/malicious.com/path');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(403);
		const text = await response.text();
		expect(text).toContain('Only .test domains are allowed');
	});

	it('redirects to valid .test domains', async () => {
		const request = new IncomingRequest('https://example.com/http://myapp.test/auth/callback');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('http://myapp.test/auth/callback');
	});

	it('preserves query parameters in redirects', async () => {
		const request = new IncomingRequest('https://example.com/http://myapp.test/auth/callback?code=123&state=abc');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('http://myapp.test/auth/callback?code=123&state=abc');
	});

	it('handles HTTPS .test domains with redirects', async () => {
		const request = new IncomingRequest('https://example.com/https://secure-app.test/oauth/callback');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('https://secure-app.test/oauth/callback');
	});

	it('handles complex paths and query strings', async () => {
		const request = new IncomingRequest('https://example.com/http://laravel-app.test/auth/github/callback?code=abc123&state=xyz789');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('http://laravel-app.test/auth/github/callback?code=abc123&state=xyz789');
	});

	it('defaults to HTTPS when no protocol is specified', async () => {
		const request = new IncomingRequest('https://example.com/myapp.test/auth/callback');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('https://myapp.test/auth/callback');
	});

	it('preserves query parameters with optional protocol', async () => {
		const request = new IncomingRequest('https://example.com/spotify-app.test/auth/callback?code=spotify123&state=random');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('https://spotify-app.test/auth/callback?code=spotify123&state=random');
	});

	it('still works with explicit HTTP protocol', async () => {
		const request = new IncomingRequest('https://example.com/http://insecure-app.test/callback');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		
		expect(response.status).toBe(302);
		expect(response.headers.get('Location')).toBe('http://insecure-app.test/callback');
	});
});
