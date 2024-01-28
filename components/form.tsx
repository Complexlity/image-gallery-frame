"use client";

import clsx from "clsx";
import {
  useRef,
  useState,
  useTransition
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useUploadThing } from "../utils/uploadthing";
import { customAlphabet } from "nanoid";

export function PollCreateForm() {

  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [imageId, setImageId] = useState("");
  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')


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
    if (files.length > 10) {
      setError("Maximum of 10 images");
      setUploadedFiles([]);
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
        setUploadedFiles([]);
        e.target.value = "";
        return;
      }
    }
    files = [...files];
    setUploadedFiles([...files]);
  }

  async function handleSubmit(event:any) {
    event.preventDefault();
    if (uploadedFiles.length === 0) {
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
      const fileUploadResponse = await startUpload(uploadedFiles).catch(
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
      setLoadingMessage("Creating Gallery...")
      const filesToSendToKVStore = filesUploaded.map((file, index) => {
        return {url: file.url, created_at: Date.now() + index}
      })

      const galleryId = imageId || nanoid()
      const payload = {
        galleryId,
        filesToSendToKVStore
      }
      try {
        const res = await fetch("api/upload-gallery", {
          method: 'POST',
          body: JSON.stringify(payload)
        })

        const result = await res.json()
        if(!result.ok) throw new Error("Something went wrong creating gallery")
        event.target.reset();
        setUploadedFiles([]);
        setError("");
      } catch (error) {
        console.log({ error })
        //@ts-expect-error message not found
        setError(error?.message)
      }

    }
    setIsLoading(false)
  }

  return (
    <>
      <div className="mx-8 w-full">
        <form
          className="relative my-8"

          onSubmit={handleSubmit}
        >
          <input
            name="image_id"
            id="image_id"
            placeholder="Id Of Your Image (optional)"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            value={imageId}
            onChange={(e) => {
              setImageId(e.target.value);
            }}
          />

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
            {uploadedFiles.map((file, index) => {
              return <li key={`file-${index}`}>{file.name}</li>;
            })}
          </div>
          <small className="text-red-400">{error}</small>
          <div className={"pt-4 flex justify-end gap-4"}>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-red-500 text-white rounded-md focus:outline-none focus:ring focus:ring-red-300 hover:bg-red-700 focus:bg-red-700",
                isLoading && "disabled cursor-not-allowed bg-red-100 hover:bg-red-100 focus:bg-red-100"
              )}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setUploadedFiles([]);
                imagesRef.current!.value = "";
              }}
            >
              Clear
            </button>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                isLoading && "disabled cursor-not-allowed bg-blue-100 hover:bg-blue-100 focus:bg-blue-100"
              )}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? loadingMessage : "Create"}
            </button>
          </div>
        </form>
      </div>
      <div className="w-full"></div>
    </>
  );
}
