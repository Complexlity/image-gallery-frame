import { kv } from "@vercel/kv";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";

// Opt out of caching for all data requests in the route segment
export const dynamic = "force-dynamic";
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const ENVI = process.env.ENVI ?? "devv";

async function getImageData(id: string, itemNumber = 0) {
  let values = (await kv.hgetall(`${id}:${ENVI}`)) as {
    files: { url: string }[];
    frameRatio?: "1.91:1" | "1:1";
  };
  let returnedItems: { url: string }[];
  if (!values) returnedItems = [];
  else returnedItems = values.files;
  let returnedItem = returnedItems[+itemNumber] as {
    url: string;
    created_at: number;
  };

  return {
    image: returnedItem?.url ?? "",
    next: itemNumber + 1,
    frameRatio: values.frameRatio ?? "1.91:1",
  };
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;
  const imageData = await getImageData(id);

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/toggle?id=${id}1`,
    "fc:frame:image": `${imageData.image}`,
    "fc:frame:button:1": "Prev",
    "fc:frame:button:2": "Next",
    "fc:frame:image:aspect_ratio": imageData.frameRatio,
  };

  return {
    title: id,
    openGraph: {
      title: id,
      images: [`${imageData.image}`],
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
      <Link href="/">
        <button className="m-4 bg-green-500 px-2 py-2 rounded-md hover:bg-green-300 flex items-center gap-1">
          {"< "}Create New Gallery
        </button>
      </Link>
    </>
  );
}
