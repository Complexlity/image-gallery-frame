//@ts-nocheck

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
          console.log({fields})
          console.log({files})
          const response = await saveFile(files.file, fields);
          console.log({response})
          const { IpfsHash } = response;

          return res.status(200).send(IpfsHash);
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
