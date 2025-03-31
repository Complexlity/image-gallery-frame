"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { List } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  // Check if current path is home or share (both should highlight home)
  const isHome = pathname === "/" || pathname?.startsWith("/share")
  const isGallery = pathname === "/gallery"

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 max-w-2xl sm:max-w-4xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-purple-400">Frame Gallery</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isHome ? "text-purple-400" : "text-gray-300 hover:text-purple-300"
              }`}
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className={`flex items-center text-sm font-medium transition-colors ${
                isGallery ? "text-purple-400" : "text-gray-300 hover:text-purple-300"
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              Gallery
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

