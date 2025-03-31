import { Galleries } from "@/components/galleries";
import { GALLERY_KV_KEY } from "@/utils/constants";
import { kv } from "@vercel/kv";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page() {
  const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;

  // Get all galleries created the past seven days
  // const ENVI = process.env.ENVI ?? "devv";
  // const keys = await kv.keys(`gallery_by_date:*`);
  // console.log(keys)
  // /*
  // 'gallery_by_date:DEVVV',
  // 'gallery_by_date:DEVVV:score',
  // 'gallery_by_date:devv',
  // 'gallery_by_date:devv:score',
  // 'gallery_by_date:private',
  // 'gallery_by_date:public',
  // 'gallery_by_date:public:dev'
  // */
  // const galleryKeys = keys.filter((key) => key.startsWith(`gallery_by_date:${ENVI}`));
  
  // let galleryIds: string[] = [];
  // for (const key of galleryKeys) {
  //   const ids = (await kv.zrange(key, 0, -1)) as string[];
  //   galleryIds = galleryIds.concat(ids);
  // }
  // console.log(galleryIds)
  const ENVI = process.env.ENVI ?? "devv";
// const keys = await kv.keys(`gallery_by_date:*`);
// console.log(keys);

  const galleryKey = `${GALLERY_KV_KEY}:${ENVI}`; 
  //Reverse sort by score

  /* 
  // Here's how the tiems are stored with create teim being the score
  await kv.zadd(zddId, {
          score: Number(parsedValues.filesToSendToKVStore[0].created_at),
          member: parsedValues.galleryId,
        });
  */

  const galleryIds = (await kv.zrange(galleryKey, 0, -1, {
    rev: true,
    withScores: true
  })) as string[];

  console.log(galleryIds)
  


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      
      <Galleries galleryIdsWithTimestamp={galleryIds} />
    </div>
  );
}
