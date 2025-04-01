import Head from "next/head";

import { kv } from "@vercel/kv";

import { CreateGalleryForm } from "@/components/create-gallery-form";


import { ENVI, GALLERY_KV_KEY } from "@/utils/constants";
import React from 'react';


export async function getServerSideProps() {
  const key = `${GALLERY_KV_KEY}:${ENVI}:score`
  const totalGalleriesCreated = await kv.get(`${GALLERY_KV_KEY}:${ENVI}:score`)
  return {props: {totalGalleriesCreated}}
}

const Home = ({totalGalleriesCreated}: {totalGalleriesCreated: number}) => {
  return (
    <>
      <Head>
        <title>Farcaster Frames Gallery</title>
        <meta
          name="description"
          content="A place to show images/gifs on farcaster frames"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <CreateGalleryForm />
      
    </>
  );
};

function VercelLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-label="Vercel Logo"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 19"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.04 2L2.082 18H22L12.04 2z"
        fill="#000"
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
      />
    </svg>
  );
}



export default Home;


