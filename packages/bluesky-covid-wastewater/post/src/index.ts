import { generateMessage } from "./generateMessage.js";
import { getDataFromCDC } from "./getDataFromCDC.js";
import { postToAtp } from "./postToAtp.js";

export const main = async () => {
  const data = await getDataFromCDC();

  const text = generateMessage(data);

  return postToAtp(text);
};
