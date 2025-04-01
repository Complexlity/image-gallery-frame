"use client"

import { useState, useEffect } from "react"
import { ImagePlus, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { HOST, WARPCAST_FRAME_URL } from "@/utils/constants"
import { CopyButton } from "./copy-button"
import { formatDate } from "@/utils/lib"

interface Gallery {
  id: string
  timestamp: number
}

export function Galleries({
  galleryIdsWithTimestamp,
  initialPage = 1,
  itemsPerPage,
  totalPages,
}: {
  galleryIdsWithTimestamp: string[]
  initialPage: number
  itemsPerPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = (useSearchParams())!

  // Initialize page from URL or props
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Parse the flat array into gallery objects
  const galleries: Gallery[] = []
  for (let i = galleryIdsWithTimestamp.length - 2; i >= 0; i -= 2) {
    galleries.push({
      id: galleryIdsWithTimestamp[i] as string,
      timestamp: galleryIdsWithTimestamp[i + 1] as unknown as number,
    })
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedGalleries = galleries.slice(startIndex, startIndex + itemsPerPage)

  // Update URL when page changes
  const updatePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    setCurrentPage(newPage)

    // Create new URL with updated page parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())

    // Update URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Listen for URL changes from external sources
  useEffect(() => {
    const pageParam = searchParams.get("page")
    if (pageParam) {
      const parsedPage = Number.parseInt(pageParam)
      if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages && parsedPage !== currentPage) {
        setCurrentPage(parsedPage)
      }
    }
  }, [searchParams, totalPages, currentPage])

  const getWarpcastUrl = (id: string) => {
    return `${WARPCAST_FRAME_URL}${encodeURIComponent(`${HOST}/gallery/${id}`)}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">Explore Created Galleries</h1>
          {/* <p className="text-gray-400">Discover and share amazing Web3 galleries</p> */}
          <Link href="/" className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300">
            <ImagePlus className="w-4 h-4 mr-2" />
            Create New Gallery
          </Link>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-700">
            {displayedGalleries.map((gallery) => (
              <div key={gallery.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-200">{gallery.id}</h3>
                    <p className="text-sm text-gray-400">{formatDate(gallery.timestamp)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CopyButton text={`${HOST}/gallery/${gallery.id}`} />
                    <a
                      href={getWarpcastUrl(gallery.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                      title="Open in Warpcast"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3">
            <div className="flex items-center">
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{startIndex + 1}</span> -{" "}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, galleries.length)}</span> of{" "}
                <span className="font-medium">{galleries.length}</span> galleries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

