import { Galleries } from "@/components/galleries";
import { ENVI, GALLERY_KV_KEY } from "@/utils/constants";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export default async function Page() {
  const galleryKey = `${GALLERY_KV_KEY}:${ENVI}`; 
  console.log({galleryKey})

  const galleryIds = (await kv.zrange(galleryKey, 0, -1, {
    withScores: true
  })) as string[];
  


  return (
      <Galleries galleryIdsWithTimestamp={galleryIds} />
     );
}
