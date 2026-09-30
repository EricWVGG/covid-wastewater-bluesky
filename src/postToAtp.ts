import { AtpAgent } from "@atproto/api"
import { blockReplies } from "./blockReplies.js"

const MAX_GRAPHEMES = 300
const segmenter = new Intl.Segmenter()
const length = (text: string) => [...segmenter.segment(text)].length

// Splits text into chunks that fit in a post, preferring paragraph breaks, then ", " separators.
export const splitIntoPosts = (text: string, max = MAX_GRAPHEMES): Array<string> => {
  const pieces = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      if (length(paragraph) <= max) return [paragraph]
      const parts = paragraph.split(/(?<=,) /)
      const out: Array<string> = []
      let current = ""
      for (const part of parts) {
        const next = current ? `${current} ${part}` : part
        if (current && length(next) > max) {
          out.push(current)
          current = part
        } else {
          current = next
        }
      }
      if (current) out.push(current)
      return out
    })

  const posts: Array<string> = []
  for (const piece of pieces) {
    const last = posts.length - 1
    if (last >= 0 && length(`${posts[last]}\n\n${piece}`) <= max) {
      posts[last] = `${posts[last]}\n\n${piece}`
    } else {
      posts.push(piece)
    }
  }
  return posts
}

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

  const [first, ...rest] = splitIntoPosts(text)

  const response = await agent.post({
    text: first,
    createdAt: new Date().toISOString(),
  })

  let parent = response
  for (const reply of rest) {
    parent = await agent.post({
      text: reply,
      reply: { root: response, parent },
      createdAt: new Date().toISOString(),
    })
  }

  if (env.BLOCK_REPLIES === "true") {
    await blockReplies(agent, response.uri)
  }

  return response
}
