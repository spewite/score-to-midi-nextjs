"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { AllowedExtensions } from "./AllowedExtensions"
import { toast } from "sonner"
import posthog from "posthog-js"

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

interface FileUploadProps {
  isConverting: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
}

export function FileUpload({ isConverting, file, setFile }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const allowedImageExtensions = [".svg", ".png", ".jpg", ".jpeg", ".bmp"];
  const allowedExtensions: string[] = [".pdf", ...allowedImageExtensions];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0]

      const extension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf(".")).toLowerCase()

      if (!allowedExtensions.includes(extension)) {
        toast.error("Uploaded file extension is not supported!")
        return;
      }

      setFile(uploadedFile)

      posthog.capture('fileAttached', {fileName: uploadedFile.name});

      // Check if the file is a PDF
      if (uploadedFile.type === "application/pdf" || extension === ".pdf") {
        // Use FileReader to load the file as an ArrayBuffer
        const fileReader = new FileReader()
        fileReader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target?.result as ArrayBuffer)
            // Load the PDF document
            const pdf = await pdfjsLib.getDocument(typedarray).promise
            // Get the first page
            const page = await pdf.getPage(1)
            const viewport = page.getViewport({ scale: 1 })

            // Create a canvas element to render the PDF page
            const canvas = document.createElement("canvas")
            const context = canvas.getContext("2d")
            if (!context) return

            canvas.width = viewport.width
            canvas.height = viewport.height

            // Render the PDF page into the canvas context
            await page.render({ canvasContext: context, viewport }).promise

            // Convert the canvas to a data URL
            const imageDataUrl = canvas.toDataURL("image/png")
            setPreview(imageDataUrl)
          } catch (error) {
            console.error("Error processing PDF:", error)
          }
        }
        fileReader.readAsArrayBuffer(uploadedFile)
      } else {
        // For image files, create an object URL as before
        setPreview(URL.createObjectURL(uploadedFile))
      }
    },
    [setFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": allowedImageExtensions,
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = () => {
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer?.files) {
        onDrop(Array.from(e.dataTransfer.files))
      }
    }

    window.addEventListener("dragover", handleDragOver)
    window.addEventListener("dragleave", handleDragLeave)
    window.addEventListener("drop", handleDrop)

    return () => {
      window.removeEventListener("dragover", handleDragOver)
      window.removeEventListener("dragleave", handleDragLeave)
      window.removeEventListener("drop", handleDrop)
    }
  }, [onDrop])

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full border-2 border-dashed rounded-lg p-8 text-center animate-fadeIn ${
        isConverting ? "cursor-wait" : "cursor-pointer"
      } transition-colors ${
        isDragActive || isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground"
      }`}
    >
      {!isConverting && <input {...getInputProps()} />}
      <div className="flex items-center justify-center">
        {preview ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_40%_1fr] gap-2 w-full">
            <div className="flex items-center justify-center">
              <AllowedExtensions allowedExtensions={allowedExtensions} />
            </div>
            <div className="flex items-center justify-center">
              <Image
                src={preview || "/placeholder.svg"}
                alt="File preview"
                width={300}
                height={300}
                className="object-contain rounded-lg animate-fadeIn max-h-[500px]"
              />
            </div>
            <div className="flex items-center justify-center text-left">
              <div>
                <p className="text-lg font-medium mb-2">{file?.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  {!isConverting && (
                    <>
                      <X className="w-4 h-4 mr-1" /> Remove file
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-primary mb-4" />
            <p className="text-lg font-medium">
              {isDragActive || isDragging
                ? "Drop the file here"
                : "Drag & drop your score image here"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              or click to select a file
            </p>
            <AllowedExtensions allowedExtensions={allowedExtensions} />
          </div>
        )}
      </div>
    </div>
  )
}
