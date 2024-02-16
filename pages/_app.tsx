import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import React from "react";
import "@/globals.css";
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
