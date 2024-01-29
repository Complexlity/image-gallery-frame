"use client";

import clsx from "clsx";
import {
  useEffect,
  useRef,
  useState,
  useTransition
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUploadThing } from "../utils/uploadthing";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";

const HOST = process.env.NEXT_PUBLIC_HOST

export function GalleryCreateForm() {

  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7)
  const [initialUploadSortingType, setInitialUploadSortingType] = useState<File[]>([]);
  const [displayedFileList, setDisplayedFileList] = useState<File[]>([])

  const [error, setError] = useState("");
  const [imageId, setImageId] = useState("");
  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [warpcastUrl, setWarpcastUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const [visibility, setVisibility] = useState('public')
  const [password, setPassword] = useState('')
  const [sortingType, setSortingType] = useState('')
  const [sortingMethod, setSortingMethod] = useState('asc')

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {
      alert("error occurred while uploading");
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => {
      //  alert("upload has begun");
    },
  });

  function showImages(e: any) {
    setError("");
    let files = e.target.files as File[];
    if (files.length > 5) {
      setError("Maximum of 10 images");
      setInitialUploadSortingType([]);
      e.target.value = "";
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const curr = files[i];
      const currType = curr.type.replace(/(.*)\//g, "")
      if (
        !(['png', 'jpeg', 'jpg', 'webp', 'gif'].includes(currType))
      ) {
        setError("Only jpeg, png, jpg ,webp and gifs files are allowed");
        setInitialUploadSortingType([]);
        e.target.value = "";
        return;
      }
    }
    files = [...files];
    setInitialUploadSortingType([...files]);
  }

  async function handleSubmit(event:any) {
    event.preventDefault();
    if (displayedFileList.length === 0) {
      setError("No File Chosen");
      return;
    }

    // event.target.reset()
    // setUploadedFiles([])
    // setError('')
    setIsLoading(true)
    setLoadingMessage("Uploading Images...")

    let filesUploaded;
    try {
      const fileUploadResponse = await startUpload(displayedFileList).catch(
        (err) => {
          console.log({ err });
        }
      );
      filesUploaded = fileUploadResponse

    } catch (error) {
      console.log({error})
      setError("Something went wrong uploading the files")
    }

    if (filesUploaded) {
      console.log(visibility)
      setLoadingMessage("Creating Gallery...")
      const filesToSendToKVStore = filesUploaded.map((file, index) => {
        return {url: file.url, created_at: Date.now() + index}
      })
      const galleryId = imageId || nanoid()
      const payload = {
        galleryId,
        filesToSendToKVStore,
        visiblity: visibility ?? 'public',
        password
      }
      try {
        const res = await fetch("api/upload-gallery", {
          method: 'POST',
          body: JSON.stringify(payload)
        })

        const result = await res.json()
        console.log({result})
        event.target.reset();
        setInitialUploadSortingType([]);
        setError("");
        setWarpcastUrl(`${HOST}/gallery/${galleryId}`)
        setImageId('')

      } catch (error) {
        console.log({ error })
        //@ts-expect-error message not found
        setError(error?.message)
      }

    }
    setIsLoading(false)

  }

  useEffect(() => {
    console.log({initialUploadSortingType})
    setDisplayedFileList(initialUploadSortingType)
    imagesRef.current!.value = "";
    setSortingMethod('default')
    setSortingType('asc')
  }, [initialUploadSortingType])

  useEffect(() => {
    let finalDisplayedData: File[] = []
    switch (sortingType) {
      case "default":
        finalDisplayedData = [...initialUploadSortingType]
        break
      case "date":
        finalDisplayedData = [...initialUploadSortingType].sort((a, b) => a.lastModified - b.lastModified)
        break
        case "name":
          finalDisplayedData = [...initialUploadSortingType].sort((a, b) => a.name.localeCompare(b.name))
          break
          case "size":
            console.log("Size sorting type")
            finalDisplayedData = [...initialUploadSortingType].sort((a, b) => a.size - b.size)
        break
    }
    console.log({finalDisplayedData})
    if (sortingMethod === "desc") {
      finalDisplayedData = [...finalDisplayedData].reverse()
    }
    setDisplayedFileList(finalDisplayedData)

  }, [sortingType])
  useEffect(() => {
    setDisplayedFileList([...displayedFileList].reverse())
  }, [sortingMethod])

  return (
    <>
      <div className="mx-8 w-full">
        <form className="relative my-8 space-y-4" onSubmit={handleSubmit}>
          <input
            name="image_id"
            id="image_id"
            placeholder="Id of existing or new gallery (optional)"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            value={imageId}
            onChange={(e) => {
              setImageId(e.target.value);
            }}
          />
          <div>


          <select
            onChange={(e) => {
              setVisibility(e.target.value);
            }}
            name=""
            id=""
            value={visibility}
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            </select>
            {visibility === "private" &&
            <details className="text-start pl-3 pr-28 mt-1">
                <summary>What are private galleries?</summary>
                <ul>
                  <li>
                    1. They do not show in <a href="/gallery">all galleries</a>{" "}
                    Page
                  </li>
                  <li>
                    2. They cannot be updated without knowing the initial
                    creation password (leave blank if you don't want to password it but still make it private)
                  </li>
                </ul>
              </details> }
            </div>
          {visibility === "private" && (
            <div>
              <input
                name="password"
                id="password"
                placeholder="Enter a password (optional)"
                className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />

            </div>
          )}

          <input
            ref={imagesRef}
            multiple
            type="file"
            id="nft"
            name="nft"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            onChange={showImages}
          />
          <div className="filenames">
            {displayedFileList.map((file, index) => {
              return <li key={`file-${index}`}>{file.name}</li>;
            })}
          </div>
          <small className="text-red-400">{error}</small>
          <div className="flex items-center py-3  px-4 mt-1 text-lg w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300 gap-2">
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
              <option value="default" >System Default</option>
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
