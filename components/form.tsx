"use client";

import clsx from "clsx";
import {
  ChangeEventHandler,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadThing } from "../utils/uploadthing";

export function PollCreateForm() {
  let formRef = useRef<HTMLFormElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let [isPending, startTransition] = useTransition();
  let [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  let [error, setError] = useState("");
  let [imageId, setImageId] = useState("");
  let imagesRef = useRef<HTMLInputElement>(null);

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
      if (
        !curr.name.includes("png") &&
        !curr.name.includes("jpeg") &&
        !curr.name.includes("jpg") &&
        !curr.name.includes("webp")
      ) {
        setError("Only jpeg, png, jpg and webp files are allowed");
        setUploadedFiles([]);
        e.target.value = "";
        return;
      }
    }
    files = [...files];
    setUploadedFiles([...files]);
  }

  return (
    <>
      <div className="mx-8 w-full">
        <form
          className="relative my-8"
          //   ref={formRef}
          //   action={saveWithNewPoll}
          onSubmit={(event) => {
            console.log("I am submitting");
            event.preventDefault();
            if (uploadedFiles.length === 0) {
              setError("No File Chosen");
              return;
            }
            formRef.current?.reset();
          }}
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
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            onChange={showImages}
          />
          <div className="filenames">
            {uploadedFiles.map((file) => {
              return <li>{file.name}</li>;
            })}
          </div>
          <small className="text-red-400">{error}</small>
          <div className={"pt-4 flex justify-end gap-4"}>
            <button
              className="flex
              items-center
              p-1
              justify-center
              px-4
              h-10
              text-lg
              border
              bg-red-600
              text-white
              rounded-md
              w-24
              focus:outline-none
              focus:ring
              focus:ring-red-300
              hover:bg-red-700
              focus:bg-red-700"
              type="button"
              onClick={() => {
                setUploadedFiles([]);
                imagesRef.current!.value = "";
              }}
            >
              Clear
            </button>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700"
              )}
              type="submit"
            >
              Create
            </button>
          </div>
        </form>
      </div>
      <div className="w-full"></div>
    </>
  );
}
