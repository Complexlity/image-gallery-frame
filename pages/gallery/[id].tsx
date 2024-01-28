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
        <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content={`https://utfs.io/f/e9206bd3-1b5b-4c3e-9ab8-5fcd6cb52a21-jksl41.jpg`}
        />
        <meta
          property="fc:frame:post_url"
          content={`${HOST}/api/toggle?id=${id}`}
        />
        <meta
          property="fc:frame:button:0"
          content={`${HOST}/api/toggle?id=${id}`}
        />
        <meta property="fc:frame:button:1" content={`Prev`} />
        <meta property="fc:frame:button:2" content={`Next`} />
      </Head>

      <div>Hello from path {id}</div>
    </>
  );
}

// export function getServerSideProps() {

// }