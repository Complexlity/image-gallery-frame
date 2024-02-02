import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";
import { customAlphabet } from "nanoid";


const ENVI = process.env.ENVI ?? "devv"

type PostBody = {
	galleryId: string,
	filesToSendToKVStore: {
		url: string,
		created_at: number
	}[],
	// visibility:"public" | "private",
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
		console.log("Before check")
		console.log({parsedValues})
		if (parsedValues.filesToSendToKVStore.length == 0) {
			return res.status(500).json({ error: "Invalid Files", success: false })
		}


		if (!parsedValues.galleryId) parsedValues.galleryId = nanoid();



		// try {
		// 	let typeValue = await kv.get(`${parsedValues.galleryId}:type:${ENVI}`)
		// 	console.log({typeValue})
		// 	if (typeValue) {
		// 		parsedValues.visibility = typeValue as "public" | "private"
		// 	}
		// }
		// catch(error) {
		// 	console.log({error})
		// 	return res.status(500).json({success:false, error: "Something Went Wrong"})
		// }

// if (parsedValues.visibility !== "private") parsedValues.visibility = "public";
// 		if (parsedValues.visibility === "public") parsedValues.password = "";
// 		if (parsedValues.visibility === "private" && !parsedValues.password) {
// 			return res.status(500).json({
// 				success: false, error: "Private Galleries must have password"
// 			})
// 		}
		console.log("After check")
		console.log({parsedValues})
		let kvId = `${parsedValues.galleryId}:${ENVI}`
		console.log({kvId})
		try {

			let preValues = await kv.hgetall(kvId);
			console.log({ preValues })
			if (preValues) {
				if (preValues.password !== parsedValues.password) {
					console.log({prevPassword: preValues.password, currentPassword: parsedValues.password})
					return res.status(500).json({
						success: false, error: "Incorrect Password"
					})
				}
				//@ts-expect-error
				let preValuesArray = Object.values(preValues.files)
				const newValues = [...preValuesArray, ...parsedValues.filesToSendToKVStore]
				const password = parsedValues.password
				console.log({newValues, password})
				//Add to id if it already exists
				await kv.hset(kvId, {
					files: newValues,
					password
				})
			}
			else {
				//Create new id key if gallery doesn't exist
				// const kvNewId = `${parsedValues.galleryId}:type:${ENVI}`;
				// await kv.set(kvNewId, parsedValues.visibility)
				await kv.hset(kvId, {
					files: parsedValues.filesToSendToKVStore,
					password: parsedValues.password
				})
				const zddId = `gallery_by_date:${ENVI}`
				console.log({zddId})
				await kv.zadd(zddId, {
					score: Number(parsedValues.filesToSendToKVStore[0].created_at),
					member: parsedValues.galleryId,
				});
				await kv.incr(`${zddId}:score`)
			}

		} catch (error) {
			console.log({ error })
			return res.status(500).json({success: false, error: "Error uploading files to store"})
		}


		return res.status(200).json({success:true,  data: values })
	}
	else {
		const galleryId = req.query.galleryId as string
		const password = req.body.password as string
		const kvId = `${galleryId}:${ENVI}`

		if (!galleryId) {
			return res.status(422).json({success: false ,error: "Please Provide a galleryId"})
		}
		let values
		try {
			values = await kv.hgetall(kvId)
			console.log({values})
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


