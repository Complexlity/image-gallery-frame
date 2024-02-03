// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log({ requestBody: req.body });
    try {
      let buttonId = req.body.untrustedData.buttonIndex || 2;
      console.log({ buttonId });
      let idNext = req.query.id as unknown as string;
      let id = idNext.slice(0, idNext.length - 1);

      res.setHeader("Content-Type", "text/html");
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <meta property="og:title" content="">
          <meta property="og:image" content="$">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="">
          <meta name="fc:frame:post_url" content="${process.env["HOST"]}/api/toggle?id=">
          <meta name="fc:frame:button:1" content="Prev">
          <meta name="fc:frame:button:2" content="Next">
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
