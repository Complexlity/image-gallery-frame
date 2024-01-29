import { type NextPage } from "next";
import Head from "next/head";

import { GalleryCreateForm } from "../components/form";
import Link from "next/link";

const Home = () => {
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
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
          <div className="flex justify-center items-center bg-black rounded-full w-12 h-12  my-8">
            <VercelLogo className="h-8  invert p-3 mb-1" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold mb-2">
            Farcaster Gallery
          </h1>
          <h2 className="text-md sm:text-xl mx-4">
            Upload Images To Your Gallery. Max per time (5)
          </h2>

          <div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
            <GalleryCreateForm />
          </div>
          <Link href="/gallery">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              All Galleries
            </button>
          </Link>
        </main>
      </div>
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


