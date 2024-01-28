import Head from "next/head";
import {  useRouter } from "next/router"

export default function Page() {
	const query = useRouter().query
	const id = query.id
	return (
    <>
      <Head>
        <title>My page title</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="http://...image-result.png" />
        <meta property="og:title" content="My page title" key="title" />
      </Head>
      <Head>
        <meta property="og:title" content="My new title" key="title" />
      </Head>
      <div>Hello from path id</div>
    </>
  );
}

export function getServerSideProps() {

}