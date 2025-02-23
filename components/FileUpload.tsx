"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
  isConverting: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
}

export function FileUpload({ isConverting, file, setFile }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0]
      setFile(uploadedFile)
      setPreview(URL.createObjectURL(uploadedFile))
    },
    [setFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".svg", ".png", ".jpg", ".jpeg", ".pdf"],
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
      className={`w-full border-2 border-dashed rounded-lg p-8 text-center ${isConverting ? 'cursor-wait' : 'cursor-pointer'} transition-colors ${
        isDragActive || isDragging ? "border-primary bg-primary/10" : "border-muted-foreground"
      }`}
    >
      {!isConverting && <input {...getInputProps()} />}
      <div className="flex items-center justify-center">
        {preview ? (
          <div className="grid grid-cols-[1fr_40%_1fr] w-full">
            <div></div>
            <div className="flex items-center justify-center">
              <Image
                src={preview || "/placeholder.svg"}
                alt="File preview"
                width={300}
                height={300}
                className="object-contain rounded-lg animate-fadeIn"
              />
            </div>
            <div className="flex items-center">
              <div>
                <p className="text-lg font-medium mb-2">{file?.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile()
                  }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center"
                >
                  {!isConverting && (<><X className="w-4 h-4 mr-1" />Remove file</>)}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-primary mb-4" />
            <p className="text-lg font-medium">
              {isDragActive || isDragging ? "Drop the file here" : "Drag & drop your score image here"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">or click to select a file</p>
          </div>
        )}
      </div>
    </div>
  )
}

