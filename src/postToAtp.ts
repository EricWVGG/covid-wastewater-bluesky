import { AtpAgent } from "@atproto/api"
import { NonRetryableError } from "cloudflare:workflows"
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

export type PostRef = { uri: string; cid: string }

const login = async (env: Env) => {
  const identifier = env.BSKY_ID
  const password = env.BSKY_PASSWORD
  if (!identifier || !password) {
    throw new NonRetryableError("Missing AT Protocol credentials. Check environment variables.")
  }
  const agent = new AtpAgent({ service: new URL("https://bsky.social") })
  await agent.login({ identifier, password })
  return agent
}

// Posts a single post; pass root/parent to post it as a reply in a thread.
export const postToAtp = async (
  text: string,
  env: Env,
  reply?: { root: PostRef; parent: PostRef }
): Promise<PostRef> => {
  const agent = await login(env)
  const { uri, cid } = await agent.post({
    text,
    ...(reply && { reply }),
    createdAt: new Date().toISOString(),
  })
  return { uri, cid }
}

export const blockRepliesToPost = async (uri: string, env: Env) => {
  await blockReplies(await login(env), uri)
}
