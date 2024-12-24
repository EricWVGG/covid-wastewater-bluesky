import { AtpAgent } from "@atproto/api";

export const postToAtp = async (text: string) => {
  const identifier = process.env.BSKY_ID;
  const password = process.env.BSKY_PASSWORD;
  if (!identifier || !password) {
    throw new Error(
      "Missing AT Protocol credentials. Check environment variables."
    );
  }
  const service = new URL("https://bsky.social");

  const agent = new AtpAgent({
    service,
  });

  await agent.login({
    identifier,
    password,
  });

  const response = await agent.post({
    text,
    createdAt: new Date().toISOString(),
  });

  return response;
};
