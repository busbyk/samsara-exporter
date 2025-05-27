import { getAllAssets } from './samsara';

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '* * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		try {
			const assets = await getAllAssets(env.SAMSARA_API_KEY);
			const { vehicles, trailers, equipment } = assets;

			console.log(
				`Retrieved ${vehicles?.length ?? 0} vehicles, ${trailers?.length ?? 0} trailers, ${equipment?.length ?? 0} equipment from Samsara.`
			);
		} catch (error) {
			console.error('Failed to get all assets from Samsara: ', error);
		}
	},
} satisfies ExportedHandler<Env>;
