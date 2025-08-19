function extractTargetUrl(pathname: string): string | null {
	if (pathname === '/') {
		return null;
	}

	let targetUrl = pathname.substring(1);

	if ( !targetUrl) {
		return null;
	}

	if ( !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
		targetUrl = 'http://' + targetUrl;
	}

	return targetUrl;
}

function isValidTestDomain(url: string): boolean {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.hostname.endsWith('.test');
	} catch {
		return false;
	}
}

function buildRedirectUrl(targetUrl: string, originalUrl: URL): string {
	const targetUrlObj = new URL(targetUrl);

	if (originalUrl.search) {
		targetUrlObj.search = originalUrl.search;
	}

	return targetUrlObj.toString();
}


export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const targetUrl = extractTargetUrl(url.pathname);

		if ( !targetUrl) {
			return new Response(null, {
				status: 302,
				headers: {
					'Location': 'https://github.com/grey-studio/forward.direct'
				}
			});
		}

		if ( !isValidTestDomain(targetUrl)) {
			return new Response(
				'Error: Only .test domains are allowed for security reasons',
				{ status: 403, headers: { 'Content-Type': 'text/plain' } }
			);
		}

		const redirectUrl = buildRedirectUrl(targetUrl, url);

		return new Response(null, {
			status: 302,
			headers: {
				'Location': redirectUrl
			}
		});
	}
} satisfies ExportedHandler<Env>;
