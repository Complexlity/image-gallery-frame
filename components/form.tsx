"use client";

import clsx from "clsx";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { useUploadThing } from "../utils/uploadthing";

import Link from "next/link";


import { ImagePlus, List, Loader2, Upload, X } from 'lucide-react';


const HOST = process.env.NEXT_PUBLIC_HOST;

export function GalleryCreateForm() {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  const [initialUploadSortingType, setInitialUploadSortingType] = useState<
    File[]
  >([]);
  const [displayedFileList, setDisplayedFileList] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [imageId, setImageId] = useState("");
  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [warpcastUrl, setWarpcastUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [sortingType, setSortingType] = useState("");
  const [sortingMethod, setSortingMethod] = useState("asc");
  const readmoreRef = useRef<HTMLInputElement | null>(null);
  const [readmoreLabel, setReadmoreLabel] = useState("");
  const [readmoreLink, setReadmoreLink] = useState("");
  const [hasReadmore, setHasReadmore] = useState(false);
  const [frameRatio, setFrameRatio] = useState<"1.91:1" | "1:1">("1.91:1");

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => {},
  });

  function showImages(e: any) {
    setError("");
    let files = e.target.files as File[];
    if (files.length > 5) {
      setError("Maximum of 5 images");
      setInitialUploadSortingType([]);
      e.target.value = "";
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const curr = files[i];
      const currType = curr.type.replace(/(.*)\//g, "");
      if (!["png", "jpeg", "jpg", "webp", "gif"].includes(currType)) {
        setError("Only jpeg, png, jpg ,webp and gifs files are allowed");
        setInitialUploadSortingType([]);
        e.target.value = "";
        return;
      }
    }
    files = [...files];
    setInitialUploadSortingType([...files]);
  }

  async function handleSubmit(event: any) {
    setError("");
    let usedReadMoreLabel = readmoreLabel;

    event.preventDefault();
    if (displayedFileList.length === 0) {
      setError("No File Chosen");
      return;
    }

    if (displayedFileList.length === 1) {
      setError("Minimum of 2 images");
      return;
    }

    if (hasReadmore && !readmoreLink) {
      setError(
        'Enter an external link or uncheck the "Add read more" checkbox'
      );
      return;
    }
    if (hasReadmore && !usedReadMoreLabel) usedReadMoreLabel = "Read More";
    setIsLoading(true);
    setLoadingMessage("Uploading Images...");

    let filesUploaded;

    try {
      const fileUploadResponse = await startUpload(displayedFileList).catch(
        (err) => {
          console.log({ err });
        }
      );
      filesUploaded = fileUploadResponse;
    } catch (error) {
      console.log({ error });
      setError("Something went wrong uploading the files");
    }

    // let filesUploaded = true
    if (filesUploaded) {
      setLoadingMessage("Creating Gallery...");
      const filesToSendToKVStore = filesUploaded.map((file, index) => {
        return { url: file.url, created_at: Date.now() + index };
      });
      const sluggifiedId = slugify(imageId, {
        replacement: "-",
        trim: true,
      });

      const galleryId = sluggifiedId || nanoid();
      let payload;
      if (hasReadmore) {
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
        event.target.reset();
        setInitialUploadSortingType([]);
        setError("");
        setWarpcastUrl(`${HOST}/gallery/${galleryId}`);
        setImageId("");
        setPassword("");
      } catch (error) {
        console.log({ error });
        //@ts-expect-error message not in error
        setError(error?.message);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setDisplayedFileList(initialUploadSortingType);
    if (initialUploadSortingType.length == 0) {
      imagesRef.current!.value = "";
    }
    setSortingMethod("default");
    setSortingType("asc");
  }, [initialUploadSortingType]);

  useEffect(() => {
    let finalDisplayedData: File[] = [];
    switch (sortingType) {
      case "default":
        finalDisplayedData = [...initialUploadSortingType];
        break;
      case "date":
        finalDisplayedData = [...initialUploadSortingType].sort(
          (a, b) => a.lastModified - b.lastModified
        );
        break;
      case "name":
        finalDisplayedData = [...initialUploadSortingType].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
      case "size":
        finalDisplayedData = [...initialUploadSortingType].sort(
          (a, b) => a.size - b.size
        );
        break;
    }
    if (sortingMethod === "desc") {
      finalDisplayedData = [...finalDisplayedData].reverse();
    }
    setDisplayedFileList(finalDisplayedData);
  }, [sortingType]);
  useEffect(() => {
    setDisplayedFileList([...displayedFileList].reverse());
  }, [sortingMethod]);

  function formatFileSize(_size: number) {
    var fSExt = new Array("Bytes", "KB", "MB", "GB"),
      i = 0;
    while (_size > 900) {
      _size /= 1024;
      i++;
    }
    var exactSize = Math.round(_size * 100) / 100 + " " + fSExt[i];
    return exactSize;
  }


  return (
    <>
      {error && (
        <p className="bg-red-300 px-4 py-2 rounded-lg w-[70%] mx-auto text">
          {error}
        </p>
      )}
      <div className="mx-8 w-full">
        <form className="relative my-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              name="image_id"
              id="image_id"
              placeholder="Id of existing or new gallery (optional)"
              className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
              value={imageId}
              onChange={(e) => {
                setImageId(e.target.value);
              }}
            />
            <details className="text-start pl-3 pr-28 mt-1">
              <summary className="text-gray-600">When to put an id?</summary>
              <ul>
                <li>
                  1. If you want to have something personalized like
                  "complexlity", "based"
                </li>
                <li>
                  2. It can be risky if you use common words (someone may have
                  already picked it)
                </li>
                <li>
                  3. You can add more images to your gallery by supplying the
                  same id used in creation. <br />
                  <strong>NOTE:</strong> If you don't want others to add their
                  images to the gallery, put a password on initial creation.
                </li>
              </ul>
            </details>
          </div>
          <div>
            <input
              name="password"
              id="password"
              placeholder="Enter a password (optional)"
              className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <details className="text-start pl-3 pr-28 mt-1">
              <summary className="text-gray-600">
                When to put a password?
              </summary>
              <ul>
                <li>
                  1. If you want to prevent others from being able to update
                  your gallery
                </li>
                <li>
                  2. Use something you can remember. If you forget it, you can
                  no longer add more images to it
                </li>
              </ul>
            </details>
          </div>
          <div>
            <select
              className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => {
                const value = e.target.value;
                if (!value || !(value == "1.91:1" || value == "1:1")) return;
                setFrameRatio(value);
              }}
            >
              <option value="" selected disabled>
                Change Frame Ratio
              </option>
              <option value="1.91:1">1.91:1(default)</option>
              <option value="1:1">1.1</option>
            </select>

            <details className="text-start pl-3 pr-28 mt-1">
              <summary className="text-gray-600">What is this?</summary>
              <ul>
                <li>It represents the frame image aspect ratio</li>
                <li>
                  By default, it is 1.91:1 but there's newly added support for
                  1:1 (square frames)
                </li>
                <li>
                  Change it to 1:1 if you want you frame images to be a square
                </li>
              </ul>
            </details>
          </div>
          <input
            ref={imagesRef}
            multiple
            type="file"
            id="nft"
            name="nft"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            onChange={showImages}
          />
          <div className="filenames">
            {displayedFileList.map((file, index) => {
              return (
                <li key={`file-${index}`}>
                  {file.name}: {formatFileSize(file.size)}
                </li>
              );
            })}
          </div>
          <div className="flex items-center py-3  px-4 mt-1 text-lg w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300 gap-2">
            <span className="w-full text-start">Sort By: </span>
            <select
              onChange={(e) => {
                setSortingType(e.target.value);
              }}
              name=""
              id=""
              value={sortingType}
              className="w-full border-2  rounded-md border-gray-400 focus:border-gray-800 cursor-pointer"
            >
              <option value="default">System Default</option>
              <option value="name">Name</option>
              <option value="date">Date (Modified)</option>
              <option value="size">Size</option>
            </select>
            <select
              onChange={(e) => {
                setSortingMethod(e.target.value);
              }}
              name=""
              id=""
              value={sortingMethod}
              className="w-full border-2  rounded-md border-gray-500 focus:border-gray-800 cursor-pointer"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className=" text-lg text-start gap-2">
            <div className="px-2">
              <input
                onChange={(e) => {
                  setHasReadmore((current) => !current);
                }}
                ref={readmoreRef}
                id="read-more"
                name="read-more"
                type="checkbox"
              />
              <label className="text-xl mx-1" htmlFor="read-more">
                Add Read More Button
              </label>
            </div>
            {hasReadmore ? (
              <>
                <input
                  required
                  value={readmoreLink}
                  onChange={(e) => {
                    setReadmoreLink(e.target.value);
                  }}
                  type="text"
                  placeholder="Enter the external link here"
                  className="pl-3 pr-28 py-3 mt-1 my-2
                  text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <input
                  value={readmoreLabel}
                  onChange={(e) => {
                    setReadmoreLabel(e.target.value);
                  }}
                  className="pl-3 pr-28 py-3 mt-1 my-2 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                  type="text"
                  placeholder="Button label (optional. Defaults to 'Read More'"
                />
              </>
            ) : null}
            <details className="px-4 m-1">
              <summary className="text-gray-600">What is this? </summary>
              <div className="text-start">
                At the end of the image slide, do you want an external link that
                takes the user outside the application? (maybe to learn more
                about what you're showing). Then tick the checkbox.
                <br />
                <strong>NOTE:</strong> THIS OPTION CANNOT BE CHANGE IF YOU
                UPDATE THE GALLERY IN FUTURE
              </div>
            </details>
          </div>
          <div className={"pt-4 flex justify-end gap-4"}>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-red-500 text-white rounded-md focus:outline-none focus:ring focus:ring-red-300 hover:bg-red-700 focus:bg-red-700",
                isLoading &&
                  "disabled cursor-not-allowed bg-red-100 hover:bg-red-100 focus:bg-red-100"
              )}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setInitialUploadSortingType([]);
                imagesRef.current!.value = "";
              }}
            >
              Clear
            </button>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                isLoading &&
                  "disabled cursor-not-allowed bg-blue-100 hover:bg-blue-100 focus:bg-blue-100"
              )}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? loadingMessage : "Create"}
            </button>
          </div>
        </form>

        {warpcastUrl && (
          <div className="flex items-center gap-2 bg-purple-900 text-white p-4 m-2">
            <span>
              Share on warpcast:
              <span className="m-1 text-green-200">{warpcastUrl}</span>
            </span>
            <button
              className={clsx("bg-orange-600 px-2 py-1 rounded-lg")}
              onClick={() => {
                navigator.clipboard.writeText(warpcastUrl);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
      <div className="w-full"></div>
    </>
  );
}


export function Gallery() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Uploading Images')
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

    // const finalGalleryId = galleryId ? 
    //   slugify(galleryId, { replacement: "-", trim: true }) : 
    //   nanoid();

    if (hasReadMore && !usedReadMoreLabel) usedReadMoreLabel = "Read More";
    setIsLoading(true);
    setLoadingMessage("Uploading Images...");
    return

    let filesUploaded;

    try {
      const fileUploadResponse = await startUpload(displayedFileList).catch(
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
        const res = {
          json: async () => ({ success: true }),
        };

        const result = await res.json();
        if (!result.success) {
          throw new Error("Mocked error");
        }
        setError("");
        setWarpcastUrl(`${HOST}/gallery/${galleryId}`);
        setImageId("");
        setPassword("");
        setIsLoading(false);
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
          <h1 className="text-4xl font-bold text-purple-400 mb-4">Frame Gallery</h1>
          <p className="text-gray-400">Create and share your Web3 gallery experience</p>
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
                className={clsx("px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800", isLoading && "hidden")} 
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className={clsx("flex items-center px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800", 
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
