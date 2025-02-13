// components/DragAndDrop.js (Cliente)
'use client';

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUpload() {
  const onDrop = useCallback((acceptedFiles) => {
    console.log("Archivos subidos:", acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
        isDragActive ? "border-blue-500 bg-blue-100" : "border-gray-300 bg-gray-50"
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-700">
        {isDragActive ? "Suelta la imagen aquí..." : "Arrastra una imagen o haz clic para subir"}
      </p>
    </div>
  );
}
