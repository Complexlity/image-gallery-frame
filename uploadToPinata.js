const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiNTgzMjMxMS1lNTQ1LTRiMTQtYTkxMS1jY2YzMmM5Y2NkMTMiLCJlbWFpbCI6Im53YWxvemllZWxpamFoQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmYWEyNzE1YzBjODk3OGRkMjUzMSIsInNjb3BlZEtleVNlY3JldCI6IjNkMTAxZTZlODc1MjkzN2JjY2VhNzljMGVmNzUxMmY2MGFmNmZjODE0OTE5MmNiOWEwMjQ5NDI0YjY1MWIxY2YiLCJpYXQiOjE3MDY5NDIyOTB9.Fo-cxAzJJPl6R5tdWHCcaPpSKbcbNQBRl-RwW9EFkIo`;

console.log({JWT})

const pinFileToIPFS = async () => {
  const formData = new FormData();
  const src = "./default.png";

  const file = fs.createReadStream(src);
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: "Default PNG",
	});

  formData.append("pinataMetadata", pinataMetadata);


  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

	console.log({formData})
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT,
        },
      }
    );
    console.log({result: res.data});
  } catch (error) {
    console.log({error});
  }
};

// pinFileToIPFS()

 const pinataFile = {
   hash:'QmPfLg9SE5NrYh3i78bGmKJkHB65nqb6LKyEsBG1hhjDvW',
    size: 3101,
    date: '2024-02-03T06:49:04.538Z'
}

const gateWay =
  "https://peach-worldwide-trout-968.mypinata.cloud/ipfs/QmPfLg9SE5NrYh3i78bGmKJkHB65nqb6LKyEsBG1hhjDvW";
