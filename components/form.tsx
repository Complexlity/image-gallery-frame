"use client";

import clsx from "clsx";
import { customAlphabet } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useUploadThing } from "../utils/uploadthing";
import slugify from "slugify";

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

  console.log({ frameRatio });

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
