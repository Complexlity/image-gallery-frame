import { Galleries } from "@/components/galleries";
import { GALLERY_KV_KEY } from "@/utils/constants";
import { kv } from "@vercel/kv";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page() {
  const ENVI = process.env.ENVI ?? "devv";
  const galleryKey = `${GALLERY_KV_KEY}:${ENVI}`; 

  const galleryIds = (await kv.zrange(galleryKey, 0, -1, {
    rev: true,
    withScores: true
  })) as string[];

  


  return (
      <Galleries galleryIdsWithTimestamp={galleryIds} />
     );
}
