"use client";

import clsx from "clsx";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { useUploadThing } from "../utils/uploadthing";

import Link from "next/link";


import { ImagePlus, List, Loader2, Upload, X } from 'lucide-react';
import { HOST } from "@/utils/constants";
import { revalidatePath } from "next/cache";

export function CreateGalleryForm() {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  const [images, setImages] = useState<File[]>([]);
  const [displayedImages, setDisplayedImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [galleryId, setGalleryId] = useState("");
  const [password, setPassword] = useState("");
  const [frameRatio, setFrameRatio] = useState<"1.91:1" | "1:1">("1.91:1");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");
  const [hasReadMore, setHasReadMore] = useState(false);
  const [readMoreLink, setReadMoreLink] = useState("");
  const [readMoreLabel, setReadMoreLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayedFileList, setDisplayedFileList] = useState<File[]>([]);
  const [imageId, setImageId] = useState("");
  const imagesRef = useRef<HTMLInputElement>(null);
  
  const [warpcastUrl, setWarpcastUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [sortingType, setSortingType] = useState("");
  const [sortingMethod, setSortingMethod] = useState("asc");
  const readmoreRef = useRef<HTMLInputElement | null>(null);
  const [readmoreLabel, setReadmoreLabel] = useState("");
  const [readmoreLink, setReadmoreLink] = useState("");
  const [hasReadmore, setHasReadmore] = useState(false);
  // const navigate = useNavigate();
  const router = useRouter()

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => {},
  });


  useEffect(() => {
    let sortedFiles = [...images];
    
    switch (sortBy) {
      case "name":
        sortedFiles.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sortedFiles.sort((a, b) => a.lastModified - b.lastModified);
        break;
      case "size":
        sortedFiles.sort((a, b) => a.size - b.size);
        break;
    }

    if (sortOrder === "desc") {
      sortedFiles.reverse();
    }

    setDisplayedImages(sortedFiles);
  }, [images, sortBy, sortOrder]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (error.length > 0) {
      const timeout = setTimeout(() => {
        setError("");
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      if (files.length > 5) {
        setError("Maximum of 5 images allowed");
        return;
      }

      const invalidFile = files.find(file => {
        const type = file.type.split('/')[1];
        return !['png', 'jpeg', 'jpg', 'webp', 'gif'].includes(type);
      });

      if (invalidFile) {
        setError("Only PNG, JPEG, JPG, WebP and GIF files are allowed");
        return;
      }

      setImages(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let usedReadMoreLabel = readMoreLabel;
    let usedHasReadMore = hasReadMore;
    if (displayedImages.length === 0) {
      setError("No files chosen");
      return;
    }

    if (displayedImages.length < 2) {
      setError("Minimum of 2 images required");
      return;
    }


    if (usedHasReadMore && !readMoreLink) {
        usedHasReadMore = false;
    }

    if (hasReadMore && !usedReadMoreLabel) usedReadMoreLabel = "Read More";
    setIsLoading(true);
    setLoadingMessage("Uploading Images...");

    let filesUploaded;

    try {
      const fileUploadResponse = await startUpload(displayedImages).catch(
        (err) => {
          console.log({ err });
        }
      );
      filesUploaded = fileUploadResponse;
    } catch (error) {
      console.log({ error });
      setError("Something went wrong uploading the files");
    setIsLoading(false);
      return
    }

    if (filesUploaded) {
      setLoadingMessage("Creating Gallery...");
      const filesToSendToKVStore = filesUploaded.map((file: {url: string}, index: number) => {
        return { url: file.url, created_at: Date.now() + index };
      });
      const sluggifiedId = slugify(imageId, {
        replacement: "-",
        trim: true,
      });

      const galleryId = sluggifiedId || nanoid();
      let payload;
      if (usedHasReadMore) {
        payload = {
          galleryId,
          filesToSendToKVStore,
          password,
          frameRatio,
          readmore: {
            label: usedReadMoreLabel,
            link: readmoreLink,
          },
        };
      } else {
        payload = {
          galleryId,
          filesToSendToKVStore,
          password,
          frameRatio,
        };
      }
      try {
        const res = await fetch("api/upload-gallery", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        setError("");
        setWarpcastUrl(`${HOST}/gallery/${galleryId}`);
        setImageId("");
        setPassword("");
        setIsLoading(false);
        revalidatePath("/gallery")
        router.push(`/share/${galleryId}`);
        

      } catch (error) {
        console.log({ error });
        //@ts-expect-error message not in error
        setError(error?.message);
      }
    }
    setIsLoading(false);
  };


  
  const clearForm = () => {
    setImages([]);
    setDisplayedImages([]);
    setGalleryId("");
    setPassword("");
    setFrameRatio("1.91:1");
    setSortBy("default");
    setSortOrder("asc");
    setHasReadMore(false);
    setReadMoreLink("");
    setReadMoreLabel("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size > 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Convert your images into Farcaster Gallery</h1>
          {/* <p className="text-gray-400">Create and share your Web3 gallery experience</p> */}
          <Link 
            href="/gallery" 
            className="inline-flex items-center mt-4 text-purple-400 hover:text-purple-300"
          >
            <List className="w-4 h-4 mr-2" />
            View All Galleries
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
            {/* Gallery ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Gallery ID
                <div className="group relative">
                  <input
                    type="text"
                    value={galleryId}
                    onChange={(e) => setGalleryId(e.target.value)}
                    placeholder="Enter a custom gallery ID (optional)"
                    className="mt-1 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="hidden group-hover:block absolute z-10 w-72 p-4 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">When to use a custom ID?</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• For personalized galleries (e.g., "my-collection")</li>
                      <li>• To make your gallery easily findable</li>
                      <li>• When planning to add more images later</li>
                      <li className="text-yellow-400">Note: Common words might already be taken</li>
                    </ul>
                  </div>
                </div>
              </label>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Password Protection
                <div className="group relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password (optional)"
                    className="mt-1 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="hidden group-hover:block absolute z-10 w-72 p-4 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Password Protection</h4>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li>• Prevents others from modifying your gallery</li>
                      <li>• Required for future updates</li>
                      <li className="text-yellow-400">Important: Save this password! You cannot recover it</li>
                    </ul>
                  </div>
                </div>
              </label>
            </div>

            {/* Frame Ratio Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Frame Ratio
                <div className="group relative">
                  <select
                    value={frameRatio}
                    onChange={(e) => setFrameRatio(e.target.value as "1.91:1" | "1:1")}
                    className="mt-1 w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1.91:1">1.91:1 (Default)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                  <div className="hidden group-hover:block absolute z-10 w-72 p-4 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">Frame Ratio</h4>
                    <p className="text-sm text-gray-300">Choose how your images will be displayed:</p>
                    <ul className="text-sm text-gray-300 mt-2 space-y-1">
                      <li>• 1.91:1 - Standard widescreen format</li>
                      <li>• 1:1 - Perfect square format</li>
                    </ul>
                  </div>
                </div>
              </label>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Upload Images
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-purple-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-400 hover:text-purple-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                        <span>Upload files</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </label>
            </div>

            {/* File List */}
            {displayedImages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Selected Files</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300"
                    >
                      <option value="default">Default</option>
                      <option value="name">Name</option>
                      <option value="date">Date</option>
                      <option value="size">Size</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-300"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
                <ul className="divide-y divide-gray-700">
                  {displayedImages.map((file, index) => (
                    <li key={index} className="py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <ImagePlus className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-300">{file.name}</span>
                      </div>
                      <span className="text-gray-400">{formatFileSize(file.size)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Read More Option */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={hasReadMore}
                  onChange={(e) => setHasReadMore(e.target.checked)}
                  className="h-4 w-4 text-purple-500 focus:ring-purple-500 border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-300">Add Read More Button</span>
              </label>

              {hasReadMore && (
                <div className="space-y-4 pl-7">
                  <input
                    type="url"
                    value={readMoreLink}
                    onChange={(e) => setReadMoreLink(e.target.value)}
                    placeholder="External link URL"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={readMoreLabel}
                    onChange={(e) => setReadMoreLabel(e.target.value)}
                    placeholder="Button label (defaults to 'Read More')"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={clearForm}
                className={clsx("flex gap-2 items-center px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-800", isLoading && "hidden")} 
              >
                <X className="w-5 h-5" />
                Clear Form
              </button>
              <button
                type="submit"
                className={clsx("flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-800", 
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                {isLoading ? loadingMessage : "Create Gallery"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
