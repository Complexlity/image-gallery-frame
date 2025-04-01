import { Galleries } from "@/components/galleries"
import { ENVI, GALLERY_KV_KEY } from "@/utils/constants"
import { kv } from "@vercel/kv"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

// Extract items per page to server component
const ITEMS_PER_PAGE = 10

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const galleryKey = `${GALLERY_KV_KEY}:${ENVI}`

  const galleryIds = (await kv.zrange(galleryKey, 0, -1, {
    withScores: true,
  })) as string[]

  // Calculate total pages
  const totalItems = galleryIds.length / 2 // Each gallery has id and timestamp
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Validate page parameter
  let currentPage = 1 // Default to page 1
  let isInvalidPage = false

  if (searchParams.page) {
    const parsedPage = Number.parseInt(searchParams.page)

    // Check if page is a valid number and within range
    if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
      currentPage = parsedPage
    } else {
      // Invalid page detected
      isInvalidPage = true
    }
  }

  // If page parameter is invalid, redirect to page 1
  if (isInvalidPage) {
    // Create a new URLSearchParams object from the current searchParams
    const params = new URLSearchParams()

    // Copy all existing parameters except page
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== "page") {
        params.set(key, value)
      }
    }

    // Set page to 1
    params.set("page", "1")

    // Redirect to the same page with updated parameters
    redirect(`?${params.toString()}`)
  }

  return (
    <Galleries
      galleryIdsWithTimestamp={galleryIds}
      initialPage={currentPage}
      itemsPerPage={ITEMS_PER_PAGE}
      totalPages={totalPages}
    />
  )
}

