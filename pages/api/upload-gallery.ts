import { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";


export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const values = req.body
		await kv.hset('complexlity', values)
		return res.status(200).json({ result: "Sent" })


	}
	else {
		const values = await kv.hgetall("complexlity")
		return res.status(200).json({ result: values })
	}
}


