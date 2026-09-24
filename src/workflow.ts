import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import type { WorkflowEvent } from "cloudflare:workers";
import { generateMessage } from "./generateMessage.js"
import { getDataFromCDC } from "./getDataFromCDC.js"
import { postToAtp } from "./postToAtp.js"

type Params = { name?: string };
type IPResponse = { result: { ipv4_cidrs: string[] } };

export class CovidWastewaterBlueskyWorkflow extends WorkflowEntrypoint<Env, Params> {
	async run(event: WorkflowEvent<Params>, step: WorkflowStep) {

		const data = await step.do("fetch data", async () => {
			const data = await getDataFromCDC(this.env)
			return data
		});

		const response = await step.do('post message', async () => {
			const text = generateMessage(data)
			return postToAtp(text, this.env)
		});

		return response;
	}
}
