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



export default Home;


