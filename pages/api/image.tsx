import * as fs from "fs";
import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import satori from "satori";
import sharp from 'sharp';
import { kv } from "@vercel/kv";


const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const galleryId = req.query.galleryId as string;
    const sort = req.query.sort || "asc";
    const itemNumber = req.query.item || 0;
    let returnedImage;

    if (!galleryId) {
      return res
        .status(422)
        .json({ success: false, error: "Please Provide a galleryId" });
    }
    let values;
    try {
      values = await kv.hgetall(galleryId);
    } catch (error) {
      console.log({ error });
      return res
        .status(500)
        .json({ success: false, error: "Error getting files from store" });
    }
    if (!values) {
      return res
        .status(404)
        .json({ success: false, error: "Items with gallery id not found" });
    }

    if (sort === "desc") {
      returnedImage = Object.values(values).reverse()[+itemNumber];
    } else {
      returnedImage = values[+itemNumber] as Record<string, unknown>;
    }

    try {

        const svg = await satori(
            <div style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: 'f4f4f4',
                padding: 50,
                lineHeight: 1.2,
                fontSize: 24,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 20,
                }}>
                </div>
            </div>
            ,
            {
                width: 600, height: 400, fonts: [{
                    data: fontData,
                    name: 'Roboto',
                    style: 'normal',
                    weight: 400
                }]
            })

        // Convert SVG to PNG using Sharp
        const pngBuffer = await sharp(Buffer.from(svg))
            .toFormat('png')
            .toBuffer();

        // Set the content type to PNG and send the response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'max-age=10');
        res.send(pngBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating image');
    }
}
