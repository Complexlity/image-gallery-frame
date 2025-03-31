'use client';

import React, { useState } from 'react';
import { ImagePlus, Copy, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { HOST, WARPCAST_FRAME_URL } from '@/utils/constants';
import { CopyButton } from './copy-button';

// Mock data matching the KV store format
// const MOCK_GALLERIES = [
//   'hy3j6td', 1741720682716,
//   'Worthhify', 1739091279037,
//   'ns6o9mr', 1738936039480,
//   'ahwwjm0', 1738935024519,
// ] as const;

const ITEMS_PER_PAGE = 10;

interface Gallery {
  id: string;
  timestamp: number;
}




export function Galleries({ galleryIdsWithTimestamp }: { galleryIdsWithTimestamp: string[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Parse the flat array into gallery objects
  const galleries: Gallery[] = [];
  for (let i = 0; i < galleryIdsWithTimestamp.length; i += 2) {
    galleries.push({
      id: galleryIdsWithTimestamp[i] as string,
      timestamp: galleryIdsWithTimestamp[i + 1] as unknown as number
    });
  }
  
  const totalPages = Math.ceil(galleries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedGalleries = galleries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const host = process.env.HOST || process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000';
  console.log({HOST})
  console.log({host})

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWarpcastUrl = (id: string) => {
    return `${WARPCAST_FRAME_URL}${encodeURIComponent(`${host}/gallery/${id}`)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Explore Galleries</h1>
          <p className="text-gray-400">Discover and share amazing Web3 galleries</p>
          <Link 
            href="/" 
            className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300"
          >
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
                    <CopyButton text={`${host}/gallery/${gallery.id}`} />
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
                Showing <span className="font-medium">{startIndex + 1}</span>
                {' '}-{' '}
                <span className="font-medium">
                  {Math.min(startIndex + ITEMS_PER_PAGE, galleries.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{galleries.length}</span>
                {' '}galleries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
  );
}