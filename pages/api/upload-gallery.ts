import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import { customAlphabet } from "nanoid";


type PostBody = {
	galleryId: string,
	filesToSendToKVStore: {
		url: string,
		created_at: number
	}[],
	visibility:"public" | "private",
	password: string

}

type ResponseData = { success: true, data: Record<string, unknown> } | { success: false, error: string}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
	const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
	if (req.method === "POST") {
		//TODO: Verify with zod
		let values = req.body


		values = JSON.parse(values)
		//TODO: Use zod
		const parsedValues = values as unknown as PostBody

		if (parsedValues.filesToSendToKVStore.length == 0) {
			return res.status(500).json({error: "Invalid Files", success: false})
		}

		if (!parsedValues.visibility) parsedValues.visibility = "public"
		if (!parsedValues.galleryId) parsedValues.galleryId = nanoid();

		if(parsedValues.visibility === "public")parsedValues.password = ""

		let kvId =`${parsedValues.galleryId}:${parsedValues.visibility}`
		try {

			let preValues = await kv.hgetall(kvId);
			console.log({ preValues })
			if (preValues) {
				if (preValues.password !== parsedValues.password) {
					return res.status(500).json({
						success: false, error: "Incorrect Password"
					})
				}
				let preValuesArray = Object.values(preValues)
				const newValues = [...preValuesArray, ...parsedValues.filesToSendToKVStore]
				const password = parsedValues.password
				//Add to id if it already exists
				await kv.hset(kvId, {
					files: newValues,
					password
				})
			}
			else {
				//Create new id key if gallery doesn't exist
				await kv.hset(kvId, {
					files: parsedValues.filesToSendToKVStore,
					password: parsedValues.password
				})
				await kv.zadd(`gallery_by_date:${parsedValues.visibility}`, {
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
		let visibility =
			req.query.visiblity
		const password = req.body.password
		if(visibility !== "public" && visibility !== "private") visibility = "public"
		const kvId = `${galleryId}:${visibility}`

		if (!galleryId) {
			return res.status(422).json({success: false ,error: "Please Provide a galleryId"})
		}
		let values
		try {
			values = await kv.hgetall(kvId)
			if (values && password !== values.password) {
				return res.status(500).json({
					success: false, error: "Incorrect Password"
				})
			}
		} catch (error) {
			console.log({ error })
			return res.status(500).json({success: false, error: "Error getting files from store"})
		}
		res.status(200).json({
			success: true, data: values as Record<string, unknown>
		})
	}
}


