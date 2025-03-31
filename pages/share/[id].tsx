import {  HOST, WARPCAST_FRAME_URL } from '@/utils/constants';
import { ChevronLeft, Copy, ExternalLink, Link2, List } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Share() {
    const [copied, setCopied] = useState(false);
    const [warpcastUrl, setWarpcastUrl] = useState('');
    const router = useRouter();
    const id = router.query.id;
    
  useEffect(() => {
    // In a real app, this would be your actual host
    setWarpcastUrl(`${WARPCAST_FRAME_URL}${encodeURIComponent(`${HOST}/share/${id}`)}`);
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(warpcastUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
    <div className="container mx-auto px-4 py-8 ">
      <div className="max-w-4xl mx-auto">
        {/* <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Share Your Gallery</h1>
          <p className="text-gray-400">Share your gallery on Warpcast</p>
        </div> */}
<div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Frame Gallery</h1>
          <p className="text-gray-400">Create and share your Web3 gallery experience</p>
          <Link 
            href="/" 
            className="inline-flex items-center  mt-4 text-purple-400 hover:text-purple-300 hover:underline"
          >
            <ChevronLeft className="w-4 h-4 mr-2 flex" />
            Create Gallery
          </Link>
        </div>
                    
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-purple-300">
                <Link2 className="inline-block w-5 h-5 mr-2" />
                Warpcast URL
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Share your gallery directly on Warpcast by using this URL
              </p>
              <div className="bg-gray-900 p-4 rounded-lg break-all text-gray-300">
                {warpcastUrl}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            
            <a
              href={warpcastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Open in Warpcast
            </a>
          </div>
        </div>
      </div>
            </div>
            </div>
  );
}