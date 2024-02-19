// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

const ENVI = process.env.ENVI ?? "devv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      let buttonId = req.body.untrustedData.buttonIndex || 2;
      let idNext = req.query.id as unknown as string;
      let id = idNext.slice(0, idNext.length - 1);

      let curr = Number(idNext[idNext.length - 1]);
      let next;

      let values = (await kv.hgetall(`${id}:${ENVI}`)) as {
        files: { url: string; created_at: number }[];
        password: string;
        frameRatio?: "1.91:1" | "1:1";
        readmore?: {
          link: string;
          label: string;
        };
      } | null;

      let returnedItems: { url: string }[];
      if (!values) returnedItems = [];
      else returnedItems = values.files;
      let sortedValues = returnedItems;
      const sortedValuesLength = sortedValues.length;

      if (buttonId == 2) {
        if (curr == sortedValuesLength) {
          curr = 0;
        }
        next = curr + 1;
      } else if (buttonId == 1) {
        if (curr == 1) {
          curr = sortedValuesLength - 1;
          next = sortedValuesLength;
        } else {
          next = curr - 1;
          curr = curr - 2;
        }
      } else if (buttonId === 3) {
        next = curr;
        curr = curr - 1;
      }

      let currentItem = sortedValues[curr];
      let showReadMore = values?.readmore && curr === sortedValuesLength - 1;

      // if(!READ_MORE_LINK) showReadMore = false
      // Return an HTML response
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gallery Item ${curr}</title>
          <meta property="og:title" content="Gallery Item ${curr}">
          <meta property="og:image" content="${currentItem.url}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${currentItem.url}">
          <meta name="fc:frame:post_url" content="${
            process.env["HOST"]
          }/api/toggle?id=${id}${next}">
          <meta name="fc:frame:button:1" content="Prev">
          <meta name="fc:frame:button:2" content="Next">
          ${
            showReadMore
              ? `
                    <meta name= "fc:frame:button:3" content = "${
                      values?.readmore?.label ?? "Read More"
                    }" >
                    <meta name= "fc:frame:button:3:action" content="link" >
                    <meta name= "fc:frame:button:3:target" content="${
                      values?.readmore?.link
                    }" >
                    `
              : ""
          }
            ${
              values?.frameRatio
                ? `<meta name="fc:frame:image:aspect_ratio" content="${values.frameRatio}">`
                : ""
            }

        </head>
        <body>

        </body>
      </html>
    `);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating image");
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
