import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.redirect(302, `${process.env.READ_MORE_LINK}`);
}
