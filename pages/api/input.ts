// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

const buttons = ['up', 'down', 'left', 'right', 'square', 'circle', 'triangle', 'x']
function getUsedButtons(page: number) {
	let usedButtons;
				switch (page) {
					case 1:
						console.log("I am here")
						usedButtons = [buttons[0], buttons[1]]
						break
					case 2:
						console.log("I am here")
						usedButtons = [buttons[2], buttons[3]]
						break
					case 3:
						console.log("I am here")
						usedButtons = [buttons[4], buttons[5]]
						break
					case 4:
						console.log("I am here")
						usedButtons = [buttons[6], buttons[7]]
						break
	}
	return usedButtons
			}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
		try {

			let buttonId = req.body.untrustedData.buttonIndex || 2;
			let currentPage = req.query.page as unknown as number
			let nextPage = +currentPage + 1

			if (currentPage > 5) {
				currentPage = 1
				nextPage = 2
			}

			let buttonsTemplate = ''

			if (currentPage > 5 && buttonId == 2) {
				//End of page. Fetch result
			}
			const usedButtons = getUsedButtons(+currentPage) ?? []

			console.log(usedButtons)




				if (currentPage == 5) {
					buttonsTemplate =
						`
					<meta name="fc:frame:button:1" content="->">
          <meta name="fc:frame:button:2" content="Fetch">
				`;
				}
				else {
					buttonsTemplate =
						`<meta name="fc:frame:button:1" content="->">
          ${usedButtons.map((button, index) => {
							return `
						<meta name="fc:frame:button:${index + 2}" content="${button}">`
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
          <meta name="fc:frame:post_url" content="${process.env["HOST"]
					}/api/input?page=${nextPage}">
					${buttonsTemplate}
        </head>
        <body>

        </body>
      </html>
    `);
			}
		catch (error) {
      console.error(error);
      res.status(500).send("Error generating image");
    }
} else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
