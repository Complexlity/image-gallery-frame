// import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from 'next';



const ENVI = process.env.ENVI ?? 'devv'
const USE_READ_MORE_LINK = true

// const HUB_URL = process.env['HUB_URL'] || "nemes.farcaster.xyz:2283"
// const client = getSSLHubRpcClient(HUB_URL);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {

        console.log({requestBody: req.body})
        try {

            // let validatedMessage: Message | undefined = undefined;
            // let frameMessage;
            // let result

            // try {
            //     frameMessage = Message.decode(Buffer.from(req.body?.trustedData?.messageBytes || '', 'hex'));
            //     console.log({frameMessage})
            //     result = await client.validateMessage(frameMessage);
            //     console.log({result})
            //     if (result.isOk() && result.value.valid) {

            //         validatedMessage = result.value.message;
            //     }
            // } catch (e)  {
            //     return res.status(400).send(`Failed to validate message: ${e}`);
            // }

            // console.log({ frameMessage })
            // console.log({result})
            // let buttonId = validatedMessage?.data?.frameActionBody?.
            //     buttonIndex || 2;
            // console.log({validatedMessage})
            let buttonId = req.body.untrustedData.buttonIndex || 2
            console.log({ buttonId })
            const readmore = req.query.readmore ?? "0";

            if (readmore == "1" && buttonId == 3) {
                console.log("I will redirect")
                return res.redirect(302, `${process.env["HOST"]}/api/redirect`);
            }

            let idNext = req.query.id as unknown as string
            let id = idNext.slice(0, idNext.length - 1)
            // let queryySort = parseInt(idSortNext[idSortNext.length - 2])
            // console.log({queryySort})
            // let querySort = queryySort == 0 ? "desc" : "asc"


            // let buttonId = req.body.buttonId || 2
            // console.log({id})
            // console.log({buttonId})
            // const querySort = req.query.sort
            // console.log({querySort})
            // let sort
            // switch (buttonId) {
            //     case 1:
            //     case 2:
            //         sort = querySort
            //         break
            //     case 3:
            //         sort = "asc"
            //         break
            //     case 4:
            //         sort = "desc"
            //         break
            //     default:
            //         sort = 'asc'
            // }

            // console.log({sort})
            let curr = Number(idNext[idNext.length - 1])
            let next;


            let values = await kv.hgetall(`${id}:${ENVI}`) as Record<string, unknown>

            console.log({ values })
            let returnedItems
            if(!values) returnedItems = []
            else returnedItems = values.files
            // console.log({returnedItems})
            let sortedValues = returnedItems;
            // if (sort == "desc") {
            //     // console.log("I am in desc")
            //     sortedValues = [...returnedItems].reverse()
            // }
            // else {
            //     // console.log("I am in asc")
            //     sortedValues = returnedItems
            // }
            // console.log({sortedValues})
            // @ts-expect-error
            const sortedValuesLength = sortedValues.length;


            if (buttonId == 2) {
                // console.log("I am in Next")
                if (curr == sortedValuesLength) {
                    curr = 0
                }
                next = curr + 1
            }

            else if (buttonId == 1) {
                // console.log("I am in Prev")
                if (curr == 1) {
                    curr = sortedValuesLength - 1
                    next = sortedValuesLength
                }
                else {
                    next = curr - 1
                    curr = curr - 2
                }
            }
            else if (buttonId === 3) {
                // curr =
                // next = 1
                next = curr
                curr = curr - 1
            }

            console.log({ curr });
            console.log({ next });

            // @ts-expect-error
            let currentItem = sortedValues[curr] as {
                url: string;
                created_at: number;
            };
            // console.log({currentItem})

            // let finalSort = sort === "desc" ? 0 : 1

            let showReadMore = curr === sortedValuesLength - 1
            if(!USE_READ_MORE_LINK) showReadMore = false
            // Return an HTML response
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gallery Item ${curr}</title>
          <meta property="og:title" content="Gallery Item ${curr}">
          <meta property="og:image" content="${currentItem.url}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${currentItem.url}">
          <meta name="fc:frame:post_url" content="${process.env['HOST']}/api/toggle?id=${id}${next}&readmore=${showReadMore ? 1 : 0}">
          <meta name="fc:frame:button:1" content="Prev">
          <meta name="fc:frame:button:2" content="Next">
          ${showReadMore ? `<meta name= "fc:frame:button:3" content = "Read More" >
          <meta name ="fc:frame:button:3:action" content="post_redirect" />
          ` : ""}

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