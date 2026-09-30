import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { generateMessage } from "./generateMessage.js"
import { getDataFromCDC } from "./getDataFromCDC.js"
import { blockRepliesToPost, postToAtp, splitIntoPosts, type PostRef } from "./postToAtp.js"

type Params = { name?: string };

export class CovidWastewaterBlueskyWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {

		const maxAttempts = Number(this.env.MAX_ATTEMPTS) || 3;
		const pauseBetweenAttempts = Number(this.env.PAUSE_BETWEEN_ATTEMPTS) || 3000;

		const data = await step.do(
			"fetch data",
			{
				retries: {
					limit: Math.max(0, maxAttempts - 1),
					delay: pauseBetweenAttempts,
					backoff: "constant",
				},
				timeout: "5 minutes",
			},
			async () => getDataFromCDC(this.env)
		);

		// Deterministic: retrying can't fix bad data, so fail immediately.
		const posts = await step.do("generate message", async () => {
			try {
				return splitIntoPosts(generateMessage(data))
			} catch (error) {
				throw new NonRetryableError(error instanceof Error ? error.message : String(error))
			}
		});

		// One step per post so a retry never re-publishes an already-completed post.
		const refs: Array<PostRef> = [];
		for (const [i, text] of posts.entries()) {
			const ref = await step.do(`post ${i + 1} of ${posts.length}`, async () =>
				postToAtp(text, this.env, i === 0 ? undefined : { root: refs[0], parent: refs[i - 1] })
			);
			refs.push(ref);
		}

		if (this.env.BLOCK_REPLIES === "true") {
			await step.do("block replies", async () => blockRepliesToPost(refs[0].uri, this.env));
		}

		return refs[0];
	}
}
