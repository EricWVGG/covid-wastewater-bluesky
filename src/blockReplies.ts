import { AtpAgent, AtUri } from "@atproto/api"

export const blockReplies = async (agent: AtpAgent, uri: string) => {
  const { rkey } = new AtUri(uri)
  const did = agent.session?.did
  if (!did) {
    throw new Error("Cannot block replies: agent has no active session.")
  }

  await agent.com.atproto.repo.createRecord({
    repo: did,
    collection: "app.bsky.feed.threadgate",
    rkey,
    record: {
      $type: "app.bsky.feed.threadgate",
      post: uri,
      allow: [],
      createdAt: new Date().toISOString(),
    },
  })
}
