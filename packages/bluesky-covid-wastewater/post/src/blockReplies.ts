import { AtpAgent, AtUri } from "@atproto/api"

export const blockReplies = async (agent: AtpAgent, uri: string) => {
  const { rkey } = new AtUri(uri)

  await agent.com.atproto.repo.createRecord({
    repo: agent.session.did,
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
