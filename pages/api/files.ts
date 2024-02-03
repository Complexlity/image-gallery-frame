//@ts-nocheck

import { kv } from "@vercel/kv";
import formidable from "formidable";
import fs from "fs";
const pinataSDK = require("@pinata/sdk");
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveFile = async (file, fields) => {
  try {
    const stream = fs.createReadStream(file.filepath);
    const options = {
      pinataMetadata: {
        name: fields.name,
      },
    };
    const response = await pinata.pinFileToIPFS(stream, options);
    fs.unlinkSync(file.filepath);

    return response;
  } catch (error) {
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const form = new formidable.IncomingForm();
      form.parse(req, async function (err, fields, files) {
        try {
          if (err) {
            console.log({ err });
            return res.status(500).send("Upload Error");
          }
          const password = fields.password
          console.log({password})
          const ipfsCID = await kv.get(`ipfs_file:${password}`)
          console.log({ipfsCID})
          if (ipfsCID) {
            return res.status(500).json({
              success: false,
              error: "Combination Already Exists"
            });
          }


          const response = await saveFile(files.file, fields);
          console.log({response})
          const { IpfsHash } = response;

          const result = await kv.set(`ipfs_file:${password}`, IpfsHash)


          return res.status(200).json({
            result,
            IpfsHash,
            password
          })
        } catch (error) {
          console.log(error);
     return  res.status(500).send("Upload Failed");

        }
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send("Server Error");
    }
  } else if (req.method === "GET") {
    try {
      const response = await pinata.pinList(
        { pinataJWTKey: process.env.PINATA_JWT },
        {
          pageLimit: 1,
        }
      );
      res.json(response.rows[0]);
    } catch (e) {
      console.log(e);
      res.status(500).send("Server Error");
    }
  }
}
