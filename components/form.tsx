"use client";

import clsx from "clsx";
import { customAlphabet } from "nanoid";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState
} from "react";
import { useUploadThing } from "../utils/uploadthing";

const HOST = process.env.NEXT_PUBLIC_HOST

export function GalleryCreateForm() {

  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7)
  const [initialUploadSortingType, setInitialUploadSortingType] = useState<File[]>([]);
  const [displayedFileList, setDisplayedFileList] = useState<File[]>([])

  const [error, setError] = useState("");
  const [imageId, setImageId] = useState("");
  const [fileName, setFileName] = useState('')
  const [file, setFile] = useState<File | null>(null);

  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // const [visibility, setVisibility] = useState('public')
  const [password, setPassword] = useState('')


  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {
      // alert("error occurred while uploading");
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => {
      //  alert("upload has begun");
    },
  });



  async function handleSubmit(e: any) {
    if(!file) return
   try {
     e.preventDefault();
     setIsLoading(true);
     console.log({file})
     const formData = new FormData();
     formData.append("file", file);
     formData.append("name", fileName ?? file.name)

     const res = await fetch("/api/files", {
       method: "POST",
       body: formData,
     });
     const ipfsHash = await res.text();
     console.log(ipfsHash)
   } catch (e) {
     console.log(e);
     setIsLoading(false);
     alert("Trouble uploading file");
   } finally {
     setIsLoading(false)
   }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    //@ts-expect-error
    setFile(e.target.files[0]);
  };


  return (
    <>
      {error && (
        <p className="bg-red-300 px-4 py-2 rounded-lg w-[70%] mx-auto text">
          {error}
        </p>
      )}
      <div className="mx-8 w-full">
        <form className="relative my-8 space-y-4 flex flex-col" onSubmit={handleSubmit}>
          <input
            name="filename"
            id="filename"
            placeholder="Custom File Name(optional)"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
            }}
          />

          <input
            ref={imagesRef}
            type="file"
            id="image"
            name="image"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            onChange={handleChange}
          />
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
        </form>
      </div>
    </>
  );
}
