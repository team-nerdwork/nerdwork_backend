import axios from "axios";
import FormData from "form-data";
import { generateFileUrl } from "../controller/file.controller";

export const pinFileToPinataByKey = async (key: string) => {
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT not configured");
  }

  const signedUrl = generateFileUrl(key, 10 * 60 * 1000); // 10 mins

  // Fetch file from S3 / CloudFront
  const fileResponse = await axios.get(signedUrl, {
    responseType: "stream",
  });

  const formData = new FormData();
  formData.append("file", fileResponse.data, {
    filename: key.split("/").pop(), // clean filename
  });
  const pinataJwt = process.env.PINATA_JWT?.trim();

  if (!pinataJwt) {
    throw new Error("PINATA_JWT is missing");
  }

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${pinataJwt}`,
      },
    },
  );

  const ipfsHash = res.data.IpfsHash;

  return `https://${process.env.PINATA_GATEWAY || "gateway.pinata.cloud"}/ipfs/${ipfsHash}`;
};

export const pinJsonToPinata = async (json: any) => {
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT not configured");
  }

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    json,
    {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    },
  );

  return res.data.IpfsHash;
};
