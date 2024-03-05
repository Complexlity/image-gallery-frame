import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import { customAlphabet } from "nanoid";
import slugify from "slugify";

const ENVI = process.env.ENVI ?? "devv";

type PostBody = {
  galleryId: string;
  filesToSendToKVStore: {
    url: string;
    created_at: number;
  }[];
  password: string;
  frameRatio: "1.91:1" | "1:1";
  readmore?: {
    link: string;
    label: "Read More" | (string & {});
  };
};

type ResponseData =
  | { success: true; data: Record<string, unknown> }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  if (req.method === "POST") {
    //TODO: Verify with zod
    let values = req.body;

    values = JSON.parse(values);
    //TODO: Use zod
    const parsedValues = values as unknown as PostBody;
    if (parsedValues.filesToSendToKVStore.length == 0) {
      return res.status(500).json({ error: "Invalid Files", success: false });
    }

    if (!parsedValues.galleryId) parsedValues.galleryId = nanoid();

    let kvId = `${parsedValues.galleryId}:${ENVI}`;
    try {
      let preValues = (await kv.hgetall(kvId)) as {
        files: { url: string; created_at: number }[];
        password: string;
        frameRatio?: "1.91:1" | "1:1";
        readmore?: {
          link: string;
          label: string;
        };
      } | null;
      if (preValues) {
        if (preValues.password !== parsedValues.password) {
          return res.status(500).json({
            success: false,
            error: "Incorrect Password",
          });
        }
        let preValuesArray = Object.values(preValues.files);
        const newValues = [
          ...preValuesArray,
          ...parsedValues.filesToSendToKVStore,
        ];
        const password = parsedValues.password;
        //Add to id if it already exists. Also retain the initial readmore option

        if (preValues.readmore) {
          await kv.hset(kvId, {
            files: newValues,
            password,
            readmore: preValues.readmore,
            frameRatio: preValues.frameRatio ?? "1.91:1",
          });
        } else {
          await kv.hset(kvId, {
            files: newValues,
            password,
            frameRatio: preValues.frameRatio ?? "1.91:1",
          });
        }
      } else {
        if (parsedValues.readmore) {
          await kv.hset(kvId, {
            files: parsedValues.filesToSendToKVStore,
            password: parsedValues.password,
            readmore: parsedValues.readmore,
            frameRatio: parsedValues.frameRatio ?? "1.91:1",
          });
        } else {
          await kv.hset(kvId, {
            files: parsedValues.filesToSendToKVStore,
            password: parsedValues.password,
            frameRatio: parsedValues.frameRatio ?? "1.91:1",
          });
        }
        const zddId = `gallery_by_date:${ENVI}`;
        await kv.zadd(zddId, {
          score: Number(parsedValues.filesToSendToKVStore[0].created_at),
          member: parsedValues.galleryId,
        });
        await kv.incr(`${zddId}:score`);
      }
    } catch (error) {
      console.log({ error });
      return res
        .status(500)
        .json({ success: false, error: "Error uploading files to store" });
    }
    return res.status(200).json({ success: true, data: values });
  } else {
    const galleryId = req.query.galleryId as string;
    const password = req.body.password as string;
    const kvId = `${galleryId}:${ENVI}`;

    if (!galleryId) {
      return res
        .status(422)
        .json({ success: false, error: "Please Provide a galleryId" });
    }
    let values;
    try {
      values = await kv.hgetall(kvId);
      if (values && password !== values.password) {
        return res.status(500).json({
          success: false,
          error: "Incorrect Password",
        });
      }
    } catch (error) {
      console.log({ error });
      return res
        .status(500)
        .json({ success: false, error: "Error getting files from store" });
    }
    res.status(200).json({
      success: true,
      data: values as Record<string, unknown>,
    });
  }
}
