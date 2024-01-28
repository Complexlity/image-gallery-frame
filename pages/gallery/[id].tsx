import Head from "next/head";
import {  useRouter } from "next/router"

export default function Page() {
	const query = useRouter().query
  const id = query.id
  const HOST = process.env.NEXT_PUBLIC_HOST
  console.log({HOST})
	return (
    <>
      <Head>
        <title>My page title</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${HOST}/api/image?id=${id}`} />
        <meta property="fc:frame:post_url" content={`${HOST}/api/toggle?id=${id}`} />
        <meta property="fc:frame:button:0" content={`${HOST}/api/toggle?id=${id}`} />
        <meta property="fc:frame:button:0" content={`Prev`} />
        <meta property="fc:frame:button:1" content={`Next`} />
        <meta property="og:title" content="My page title" key="title" />
      </Head>
      <Head>
        <meta property="og:title" content="My new title" key="title" />
      </Head>
      <div>Hello from path {id}</div>
    </>
  );
}

// export function getServerSideProps() {

// }