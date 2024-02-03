// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

const buttons = ['up', 'down', 'left', 'right', 'square', 'circle', 'triangle', 'x']

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {

			let buttonId = req.body.untrustedData.buttonIndex || 2;
			const page = req.query as unknown as number

			let usedButtons: string[] = []
			let buttonsTemplate = ''

			if (page == 1 && buttonId == 2) {
				//End of page. Fetch result
			}

			switch (page) {
				case 1:
					usedButtons = [buttons[0], buttons[1]]
				case 2:
					usedButtons = [buttons[2], buttons[3]]
				case 3:
					usedButtons = [buttons[4], buttons[5]]
				case 4:
					usedButtons = [buttons[6], buttons[7]]

			}

			if (page == 5) {
				buttonsTemplate =
				`
					<meta name="fc:frame:button:1" content="->">
          <meta name="fc:frame:button:2" content="">
				`;
			}
			else {
				buttonsTemplate =
					`<meta name="fc:frame:button:1" content="->">
          ${usedButtons.map((button, index) => {
						return `
						<meta name="fc:frame:button:${index + 2}" content="">`
					})}
					<meta name="fc:frame:button:4" content="Clear">
					`
			}




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
          <meta name="fc:frame:post_url" content="${
            process.env["HOST"]
          }/api/input?page=${page > 5 ? 1 : page + 1}=">
					${buttonsTemplate}
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
