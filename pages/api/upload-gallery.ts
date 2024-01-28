import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

type PostBody = {
	galleryId: string,
	filesToSendToKVStore: {
		url: string,
		created_at: number
	}[]

}

type ResponseData = { success: true, data: Record<string, unknown> } | { success: false, error: string}

export  default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
	if (req.method === "POST") {
		//TODO: Verify with zod
		let values = req.body


		values = JSON.parse(values)
		//TODO: Use zod
		const parsedValues = values as unknown as PostBody


		try {

			let preValues = await kv.hgetall(parsedValues.galleryId);
			console.log({ preValues })
			if (preValues) {
				let preValuesArray = Object.values(preValues)
				const newValues = [...preValuesArray, ...parsedValues.filesToSendToKVStore]
				console.log(newValues)
				//Add to id if it already exists
				await kv.hset(parsedValues.galleryId, {...newValues})
			}
			else {
				//Create new id key if gallery doesn't exist
				//@ts-expect-error
				await kv.hset(parsedValues.galleryId, parsedValues.filesToSendToKVStore)
				await kv.zadd("gallery_by_date", {
					score: Number(parsedValues.filesToSendToKVStore[0].created_at),
					member: parsedValues.galleryId,
				});
			}

		} catch (error) {
			console.log({ error })
			return res.status(500).json({success: false, error: "Error uploading files to store"})
		}


		return res.status(200).json({success:true,  data: values })
	}
	else {
		const galleryId = req.query.galleryId as string
		const sort = req.query.sort || 'asc'
		const itemNumber = req.query.item  || 0
		let returnedImage;

		if (!galleryId) {
			return res.status(422).json({success: false ,error: "Please Provide a galleryId"})
		}
		let values
		try {
			values = await kv.hgetall(galleryId)
		} catch (error) {
			console.log({ error })
			return res.status(500).json({success: false, error: "Error getting files from store"})
		}
		if (!values) {
			return res.status(404).json({success: false, error: "Items with gallery id not found"})
		}

		if (sort === "desc") {
			returnedImage = Object.values(values).reverse()[+itemNumber]
		}
		else {
			returnedImage = values[+itemNumber] as Record<string, unknown>
		}
		return res
      .status(200)
      .json({ success: true, data: returnedImage as Record<string, unknown> });
	}
}


