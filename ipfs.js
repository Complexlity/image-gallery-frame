const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const JWT =
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    .eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiNTgzMjMxMS1lNTQ1LTRiMTQtYTkxMS1jY2YzMmM5Y2NkMTMiLCJlbWFpbCI6Im53YWxvemllZWxpamFoQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzNWViNGM2Y2ZmOTQwNWNiYzNiMiIsInNjb3BlZEtleVNlY3JldCI6Ijg3ZjczMGU2MTc0ZGQ2NDhjM2Q1YTVlMDc4MTE2MzdhYmVlMTM5YmNlNDVlMTllOGFlNzY2ZmFhYWEzNmVhOTUiLCJpYXQiOjE3MDY5NDIxMTh9
    .RCzv2CnYZoHDAlKGRxWhJeZ5n - vpsMtU0OA16eZlzm4;

const pinFileToIPFS = async () => {
  const formData = new FormData();
  const src = "path/to/file.png";

  const file = fs.createReadStream(src);
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: "File name",
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    console.log(res.data);
  } catch (error) {
    console.log(error);
  }
};
pinFileToIPFS();
