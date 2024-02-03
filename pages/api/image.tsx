import * as fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import satori from "satori";
import sharp from "sharp";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

const mapping = {
  u: "up",
  d: "down",
  l: "left",
  r: "right",
  s: "square",
  c: "circle",
  t: "triangle",
  x: "x",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = req.query.input as unknown as string;
  let inputAsArray = [];
  for (let i = 0; i < input.length; i++) {
    inputAsArray.push(input[i]);
  }

  console.log({ input });

  console.log({ inputAsArray });

  try {
    const svg = await satori(
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",

          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "f4f4f4",
          padding: 0,
          lineHeight: 1.2,
          fontSize: 24,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 20,
          }}
        >
          <h1>Combination</h1>
          {inputAsArray.length > 0 ? (
            <div style={{ display: "flex" }}>
              {inputAsArray.map((item) => {
                //@ts-expect-error
                if (!mapping[item]) return null;

                //@ts-expect-error
                return `${mapping[item]},`;
              })}
            </div>
          ) : null}
        </div>
      </div>,
      {
        width: 600,
        height: 400,
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    // Set the content type to PNG and send the response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating image");
  }
}
