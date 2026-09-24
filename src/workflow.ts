import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import { generateMessage } from "./generateMessage.js"
import { getDataFromCDC } from "./getDataFromCDC.js"
import { postToAtp } from "./postToAtp.js"

type Params = { name?: string };
type IPResponse = { result: { ipv4_cidrs: string[] } };

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

		const response = await step.do('post message', async () => {
			const text = generateMessage(data)
			return postToAtp(text, this.env)
		});

		return response;
	}
}
