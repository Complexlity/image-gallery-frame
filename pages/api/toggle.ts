import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from 'next';



const HUB_URL = process.env['HUB_URL'] || "nemes.farcaster.xyz:2283"
const client = getSSLHubRpcClient(HUB_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        try {

            let validatedMessage : Message | undefined = undefined;
            try {
                const frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
                const result = await client.validateMessage(frameMessage);
                if (result.isOk() && result.value.valid) {
                    validatedMessage = result.value.message;
                }
            } catch (e)  {
                return res.status(400).send(`Failed to validate message: ${e}`);
            }

            const buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 2;
            let id = req.query.id as unknown as string
            // let buttonId = req.body.buttonId || 2
            console.log({id})
            console.log({buttonId})
            const querySort = req.query.sort
            console.log({querySort})
            let sort
            switch (buttonId) {
                case 1:
                case 2:
                    sort = querySort
                    break
                case 3:
                    sort = "asc"
                    break
                case 4:
                    sort = "desc"
                    break
                default:
                    sort = 'asc'
            }

            console.log({sort})
            let curr = Number(req.query.next)
            let next;


            let values = await kv.hgetall(id) as Record<string, unknown>
            console.log({values})
            let returnedItems = Object.values(values)
            console.log({returnedItems})
            let sortedValues;
            if (sort == "desc") {
                console.log("I am in desc")
                sortedValues = [...returnedItems].reverse()
            }
            else {
                console.log("I am in asc")
                sortedValues = returnedItems
            }
            console.log({sortedValues})
            const sortedValuesLength = sortedValues.length;


            if (buttonId == 2) {
                console.log("I am in Next")
                if (curr == sortedValuesLength) {
                    curr = 0
                }
                    next = curr + 1
            }

            else if (buttonId == 1) {
                console.log("I am in Prev")
                if (curr == 1) {
                    curr = sortedValuesLength -1
                    next = sortedValuesLength
                }
                else {
                    next = curr - 1
                    curr = curr - 2
                }
            }
            else if (buttonId === 3 || buttonId === 4) {
                next = curr
                curr = curr - 1
            }

            console.log({ curr });
            console.log({ next });

            let currentItem = sortedValues[curr] as {
              url: string;
              created_at: number;
            };
            console.log({currentItem})




            // Return an HTML response
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Recorded</title>
          <meta property="og:title" content="Vote Recorded">
          <meta property="og:image" content="${currentItem.url}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${currentItem.url}">
          <meta name="fc:frame:post_url" content="${process.env['HOST']}/api/toggle?id=${id}&sort=${sort}&next=${next}">
          <meta name="fc:frame:button:1" content="Prev">
          <meta name="fc:frame:button:2" content="Next">
          <meta name="fc:frame:button:3" content="Sort(asc)">
          <meta name="fc:frame:button:4" content="Sort(desc)">
        </head>
        <body>

        </body>
      </html>
    `);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error generating image');
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
// export default async function handler( req: NextApiRequest,res: NextApiResponse) {
//     res.status(200).json({status: "OK"})
// }