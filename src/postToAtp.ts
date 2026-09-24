import { AtpAgent } from "@atproto/api"
import { blockReplies } from "./blockReplies.js"

export const postToAtp = async (text: string, env: Env) => {
  const identifier = env.BSKY_ID
  const password = env.BSKY_PASSWORD
  if (!identifier || !password) {
    throw new Error("Missing AT Protocol credentials. Check environment variables.")
  }
  const service = new URL("https://bsky.social")

  const agent = new AtpAgent({
    service,
  })

  await agent.login({
    identifier,
    password,
  })

  const response = await agent.post({
    text,
    createdAt: new Date().toISOString(),
  })

  if (env.BLOCK_REPLIES === "true") {
    await blockReplies(agent, response.uri)
  }

  return response
}
