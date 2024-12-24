import { AtpAgent } from "@atproto/api";
import { generateMessage } from "./generateMessage.js";
import { getData } from "./getData.js";

export const main = async () => {
  const data = await getData();

  const text = generateMessage(data);

  const agent = new AtpAgent({
    service: "https://bsky.social",
  });

  await agent.login({
    identifier: process.env.BSKY_ID,
    password: process.env.BSKY_PASSWORD,
  });

  const response = await agent.post({
    text,
    createdAt: new Date().toISOString(),
  });

  return response;
};
