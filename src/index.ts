import { getAllAssets } from './samsara';

async function retrieveAndLogAssets(env: Env) {
	const assets = await getAllAssets(env.SAMSARA_API_KEY);
	const { vehicles, trailers, equipment } = assets;

	console.log(
		`Retrieved ${vehicles?.length ?? 0} vehicles, ${trailers?.length ?? 0} trailers, ${equipment?.length ?? 0} equipment from Samsara.`
	);
	console.log('All assets: ', JSON.stringify(assets, null, 2));
	
	return assets;
}

export default {
	async fetch(req, env) {
		const url = new URL(req.url);
		
		// Handle GET requests for asset retrieval
		if (req.method === 'GET') {
			try {
				const assets = await retrieveAndLogAssets(env);
				return new Response(JSON.stringify(assets, null, 2), {
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				console.error('Failed to get all assets from Samsara: ', error);
				return new Response(JSON.stringify({ error: 'Failed to retrieve assets' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		// Handle scheduled endpoint info
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '0 * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		try {
			await retrieveAndLogAssets(env);
		} catch (error) {
			console.error('Failed to get all assets from Samsara: ', error);
		}
	},
} satisfies ExportedHandler<Env>;
