import { kv } from '@vercel/kv'
import { NextApiRequest, NextApiResponse } from 'next';

const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;
const ENVI = process.env.ENVI ?? "devv"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let visibility = req.body.visiblity ?? "public"
	let galleryIds = await kv.zrange(
    `gallery_by_date:${ENVI}`,
    Date.now(),
    Date.now() - SEVEN_DAYS_IN_MS,
    { byScore: true, rev: true }
	);

	res.status(200).json({galleryIds})
}