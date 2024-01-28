import { kv } from "@vercel/kv";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getImageData(id: string, itemNumber = 0, sort = "asc") {
  let values = (await kv.hgetall(id)) as Record<string, unknown>;
  let returnedItem;
  if (sort === "desc") {
    returnedItem = Object.values(values).reverse()[+itemNumber] as {
      url: string;
      created_at: number;
    };
  } else {
    returnedItem = Object.values(values)[+itemNumber] as {
      url: string;
      created_at: number;
    };
  }
  return { image: returnedItem.url, next: itemNumber + 1, sort };
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
    "fc:frame:post_url": `${process.env["HOST"]}/api/toggle?id=${id}11}`,
    "fc:frame:image": `${imageData.image}`,
    "fc:frame:button:1": "Prev",
    "fc:frame:button:2": "Next",
    "fc:frame:button:3": "Sort(asc)",
    "fc:frame:button:4": "Sort(desc)",
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
      <div></div>
    </>
  );
}
