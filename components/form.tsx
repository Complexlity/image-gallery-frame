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
import { Brush } from 'lucide-react';
import {
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  Square,
  Circle,
  Triangle,
  X
} from "lucide-react";


const HOST = process.env.NEXT_PUBLIC_HOST

export function GalleryCreateForm() {
  const passwordRef = useRef(null)
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
  const [password, setPassword] = useState<string[]>([])


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
     setLoadingMessage("Uploading...")
     console.log({file})
     const formData = new FormData();
     formData.append("file", file);
     formData.append("name", fileName ?? file.name)


    //  const myPromise = new Promise((resolve) => {
    //    setTimeout(() => {
    //      console.log("resolved promise")
    //      resolve("I resolved")
    //    }, 5000);
    //  })

    //  const ress = await myPromise
    //  console.log({ress})
     //  return
     console.log({fileName: formData.get('name')})
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
     setLoadingMessage("Create")
   }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    //@ts-expect-error
    setFile(e.target.files[0]);
  };

  function handleButtonClick(text: string){
    setPassword([...password, text])
    return
  }


  return (
    <>
      {error && (
        <p className="bg-red-300 px-4 py-2 rounded-lg w-[70%] mx-auto text">
          {error}
        </p>
      )}
      <div className="mx-8 w-full">
        <form
          className="relative my-8 space-y-4 flex flex-col"
          onSubmit={handleSubmit}
        >
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
          <div>
            <div className=" py-3 px-4 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300 text-start">
              {password.length > 0 ? (
                <PasswordButtons password={password} />
              ) : (
                "Click buttons to set combination"
              )}
            </div>
            <div className="flex gap-2 py-4">
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("up")}
              >
                {/* Add your up icon here */}
                <ArrowBigUp className="text-purple-800" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("down")}
              >
                {/* Add your down icon here */}
                <ArrowBigDown className="text-purple-800" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("left")}
              >
                {/* Add your down icon here */}
                <ArrowBigLeft className="text-purple-800" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("right")}
              >
                {/* Add your down icon here */}
                <ArrowBigRight className="text-purple-800" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("square")}
              >
                {/* Add your down icon here */}
                <Square className="text-green-600" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("circle")}
              >
                {/* Add your down icon here */}
                <Circle className="text-sky-700" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("triangle")}
              >
                {/* Add your down icon here */}
                <Triangle className="text-red-600" />
              </button>
              <button
                type="button"
                className="bg-gray-300 rounded-md p-2 hover:bg-blue-400"
                onClick={() => handleButtonClick("x")}
              >
                {/* Add your down icon here */}
                <X className="text-yellow-600" />
              </button>
              <button
                type="button"
                className="bg-red-600 px-4 py-2 text-white hover:bg-red-400"
                onClick={() => setPassword([])}
              >
                {/* Add your down icon here */}
                Clear
              </button>
            </div>
          </div>

          <button
            className={clsx(
              "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
              isLoading &&
                "disabled cursor-not-allowed bg-blue-300 hover:bg-blue-300 focus:bg-blue-300"
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


function PasswordButtons({ password }: { password: string[] }) {
  const mapping = {
    up: <ArrowBigUp className="fill-purple-800 text-purple-800" />,
    down: <ArrowBigDown className="fill-purple-800 text-purple-800" />,
    left: <ArrowBigLeft className="fill-purple-800 text-purple-800" />,
    right: <ArrowBigRight className="fill-purple-800 text-purple-800" />,
    square: <Square className="fill-green-600 text-green-600" />,
    circle: <Circle className="fill-sky-700 text-sky-700" />,
    triangle: <Triangle className="fill-red-600 text-red-700" />,
    x: <X className="fill-yellow-600 text-yellow-600" />,
  };

  return (
    <div className="flex gap-1">
      {password.map(
        (item, index) =>
          // Use square bracket notation to dynamically access the corresponding JSX icon
          //@ts-expect-error
          mapping[item]
      )}
    </div>
  );
}