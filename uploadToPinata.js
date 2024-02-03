const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const JWT = `Bearer `;

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
