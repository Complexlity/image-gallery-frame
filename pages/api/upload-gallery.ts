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


		values = JSON.parse(values) as PostBody



		await kv.hset(values.galleryId, values.filesToSendToKVStore)
		return res.status(200).json({ result: values })


	}
	else {
		const galleryId = req.query.galleryId as string
		const sort = req.query.sort || 'asc'
		const itemNumber = req.query.item  || 0
		let returnedImage;

		if (!galleryId) {
			return res.status(422).json({message: "Please Provide a galleryId"})
		}
		const values = await kv.hgetall(galleryId)
		if (!values) {
			return res.status(404).json({message: "Items with gallery id not found"})
		}


		if (sort === "desc") {
			returnedImage = Object.values(values).reverse()[+itemNumber]
		}
		else {
			returnedImage = values[+itemNumber]
		}
		return res.status(200).json({ result: returnedImage })
	}
}


