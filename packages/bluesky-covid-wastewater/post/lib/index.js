import { AtpAgent } from "@atproto/api";
import { generateMessage } from "./generateMessage.js";
import { getData } from "./getData.js";
export const main = async () => {
    const identifier = process.env.BSKY_ID;
    const password = process.env.BSKY_PASSWORD;
    if (!identifier || !password) {
        throw new Error("Missing AT Protocol credentials. Check environment variables.");
    }
    const data = await getData();
    const text = generateMessage(data);
    const agent = new AtpAgent({
        service: "https://bsky.social",
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
