import { kv } from '@vercel/kv';
import Link from 'next/link';



export default async function Page() {
  const SEVEN_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 7;
  const ENVI = process.env.ENVI ?? 'devv'
    let galleryIds = await kv.zrange(
      `gallery_by_date:${ENVI}`,
      Date.now(),
      Date.now() - SEVEN_DAYS_IN_MS,
      { byScore: true, rev: true }
  );

  console.log({galleryIds})

	return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-lg sm:text-2xl font-bold mb-2">Created Galleries</h1>
        <div className="flex-1 flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
          {galleryIds.map((id, index) => {
            // returns links to poll ids
            return (
              // @ts-expect-error
              <div key={id}>
                <a href={`/gallery/${id}`} className="underline">

                  <p className="text-md
                  sm:text-xl mx-4">
                  {/* @ts-expect-error */}
                    {id}
                  </p>
                </a>
              </div>
            );
          })}
        </div>
        <Link href="/">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create New Gallery
          </button>
        </Link>
      </main>
    </div>
  );
}




