import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

type PostBody = {
	galleryId: string,
	filesToSendToKVStore: {
		url: string,
		created_at: number
	}
}

export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		//TODO: Verify with zod
		let values = req.body
		console.log({ values })
		console.log(values.galleryId, values.filesToSendToKVStore)

		values = JSON.parse(values) as PostBody

		console.log(values.galleryId, values.filesToSendToKVStore)

		await kv.hset(values.galleryId, values.filesToSendToKVStore)
		return res.status(200).json({ result: values })


	}
	else {
		const galleryId = req.query.galleryId as string
		const sort = req.query.sort || 'asc'
		const itemNumber = req.query.item  || 0
		let returnedImage;

		console.log(galleryId)
		if (!galleryId) {
			return res.status(422).json({message: "Please Provide a galleryId"})
		}
		console.log({sort, itemNumber})
		const values = await kv.hgetall(galleryId)
		if (!values) {
			return res.status(404).json({message: "Items with gallery id not found"})
		}


		console.log(sort)
		if (sort === "desc") {
			console.log("Sort is descending")
			returnedImage = Object.values(values).reverse()[+itemNumber]
		}
		else {
			console.log("Sort is ascending")
			returnedImage = values[+itemNumber]
		}
		return res.status(200).json({ result: returnedImage })
	}
}


