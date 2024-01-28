import { Metadata, ResolvingMetadata } from "next";


type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
    const id = params.id;

  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["HOST"]}/api/toggle?id=${id}`,
    "fc:frame:image": `https://utfs.io/f/e9206bd3-1b5b-4c3e-9ab8-5fcd6cb52a21-jksl41.jpg`,
    "fc:frame:button:1": "Prev",
    "fc:frame:button:2": "Next"
  };


  return {
    title: id,
    openGraph: {
      title: id,
      images: [
        `https://utfs.io/f/e9206bd3-1b5b-4c3e-9ab8-5fcd6cb52a21-jksl41.jpg`,
      ],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["HOST"] || ""),
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id
  return (
    <>
      <div>Hello from path {id}</div>
    </>
  );
}
