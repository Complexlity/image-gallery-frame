import { ENVI } from "@/utils/constants";
import { kv } from "@vercel/kv";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

// Opt out of caching for all data requests in the route segment
export const dynamic = "force-dynamic";
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};


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
    frameRatio: values?.frameRatio ?? "1.91:1",
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
    "of:version": "vNext",
    "of:image": `${imageData.image}`,
    "og:image": `${imageData.image}`,
    "of:button:1": "Prev",
    "of:button:2": "Next",
    "of:post_url": `${process.env["HOST"]}/api/toggle?id=${id}1`,
    "of:image:aspect_ratio": imageData.frameRatio,
    "of:accepts:xmtp": "2024-02-01",
    "of:accepts:lens": "1.1",
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
function isBrowser(userAgent: string | null): boolean {
  if (!userAgent) return false

  // Common browser identifiers
  const browserIdentifiers = ["Mozilla", "Chrome", "Safari", "Firefox", "Edge", "Opera"]

  // Check if it's likely a browser
  const containsBrowserIdentifier = browserIdentifiers.some((id) => userAgent.includes(id))

  // Consider it a browser if it contains browser identifiers but not bot identifiers
  return containsBrowserIdentifier 
}

  // const headersList = headers()
  // const userAgent = headersList.get("user-agent")

  // // Redirect browser users to another page
  // if (isBrowser(userAgent)) {
  //   // You can redirect to any URL you want
  //   redirect(`/`)
  // }



  return (
    <>
      <div>
      </div>
    </>
  );
}
