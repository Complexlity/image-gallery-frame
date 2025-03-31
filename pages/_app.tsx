import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import React from "react";
import "@/globals.css";
import { Navbar } from "@/components/navbar";
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
