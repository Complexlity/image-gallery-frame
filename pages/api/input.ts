// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

const buttons = ['up', 'down', 'left', 'right', 'square', 'circle', 'triangle', 'x']
const mapping = {
   "up" : "u",
   "down" : "d",
   "left" : "l",
   "right" : "r",
   "square" : "s",
   "circle" : "c",
   "triangle" : "t",
   "x" : "x",
};

function getNextInput(page: number, buttonId: number) {
	let nextInput = ''
	if (page == 2) {
		nextInput = buttonId == 2 ? 'u' : 'd'
	}
	if (page == 3) {
		nextInput = buttonId == 2 ? 'l' : 'r'

	}
	if (page == 4) {
		nextInput = buttonId == 2 ? 's' : 'c'

	}
	if (page == 5) {
		nextInput = buttonId == 2 ? 't' : 'x'
	}
	
	return nextInput;
}

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
			let input = req.query.input as unknown as string
			let nextInput = input + getNextInput(currentPage, buttonId)
			console.log({nextInput})



			let buttonsTemplate = ''

			if (currentPage > 5 && buttonId == 2) {
				//End of page. Fetch result
        const key = `ipfs_file:${input}`;
        const ipfsCID = await kv.get(key);
				let finalImageUrl: string;
				console.log({ ipfsCID });

        if (ipfsCID) {
          finalImageUrl = process.env.PINATA_GATEWAY + "/ipfs/" + ipfsCID;
        }
				else {
					finalImageUrl = `${process.env['HOST']}/api/finalImage`
				}
				const postUrl = `${process.env["HOST"]}/api/input?page=2`;

				res.setHeader("Content-Type", "text/html");
return  res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <meta property="og:title" content="Final Image">
          <meta property="og:image" content="${finalImageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${finalImageUrl}">
          <meta name="fc:frame:post_url" content="${postUrl}"
					<meta name="fc:frame:button:1" content="Fetch Another" />
        </head>
        <body>

        </body>
      </html>
    `);
			}

			if (currentPage > 5) {
        currentPage = 1;
        nextPage = 2;
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

			if (buttonId == 4) {
				nextInput = ""
				nextPage = currentPage
}


const imageUrl = `${process.env['HOST']}/api/image?input=${nextInput}`
const postUrl = `${process.env["HOST"]}/api/input?page=${nextPage}&input=${nextInput}`;



				res.setHeader("Content-Type", "text/html");
				res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title></title>
          <meta property="og:title" content="">
          <meta property="og:image" content="$">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content=${imageUrl}>
          <meta name="fc:frame:post_url" content="${postUrl}">
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
