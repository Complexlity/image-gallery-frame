import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import React from "react";
import "@/globals.css"
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      {/* <Head>
        <meta
          name="description"
          content="A place to discover, create and buy exclusive NFTs."
        />
        <meta property="og:title" content="Farcaster Gallery" />
        <meta
          property="og:description"
          content="A place to upload images and gifs to farcaster frames"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="." />
        <meta property="og:site_name" content="Farcaster Gallery" />
        <meta
          property="og:image"
          content="https://image-gallery-frame.vercel.app/og.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:locale" content="en_US" />
      </Head> */}

              <Component {...pageProps} />

    </>
  );
};

export default MyApp;
