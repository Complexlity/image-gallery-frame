import { kv } from "@vercel/kv";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getImageUrl(id: string, itemNumber = 0) {
  const sort = "asc";

  let values = await kv.hgetall(id) as Record<string, unknown>
  let returnedImage = Object.values(values)[+itemNumber] as  {url: string, created_at: number}
  return { image: returnedImage.url, item: itemNumber }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;
  const imageUrl = await getImageUrl(id)

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/toggle?id=${id}`,
    "fc:frame:image": `${imageUrl.image}`,
    "fc:frame:button:1": "Prev",
    "fc:frame:button:2": "Next",
    "fc:frame:button:3": "Sort(asc)",
    "fc:frame:button:4": "Sort(desc)",
  };

  return {
    title: id,
    openGraph: {
      title: id,
      images: [
        `${imageUrl.image}`,
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <>
      <div>Hello from path {id}</div>
    </>
  );
}
