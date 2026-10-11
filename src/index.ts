export { CovidWastewaterBlueskyWorkflow } from "./workflow";

// Runs are started by the `schedules` cron on the workflow binding (see wrangler.jsonc).
// To post manually: `npx wrangler workflows trigger covid-wastewater-bluesky-workflow`
// This handler is read-only on purpose: any public request (crawlers, favicon fetches,
// link previews) used to create an instance and publish a post.
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const instanceId = url.searchParams.get("instanceId");

		if (!instanceId) {
			return new Response("Not found", { status: 404 });
		}

		const instance = await env.COVID_WASTEWATER_BLUESKY_WORKFLOW.get(instanceId);
		return Response.json(await instance.status());
	},
} satisfies ExportedHandler<Env>;
