"use client"

import React, { FormEvent, useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { image, Spinner } from "@heroui/react";
import { Button } from "@heroui/react";

export default function Home() {

  const [downloadUUID, setDownloadUUID] = useState<string|undefined>(undefined);
  const [imageFile, setImageFile] = useState<File|undefined>(undefined);
  const [submitable, setSubmitable] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string|undefined>(undefined);
  const [success, setSuccess] = useState<string|undefined>(undefined);

  const handleFileUpload = async () => {
    
    console.log("handleFileUpload()")
    
    try {

      if (!imageFile) {
        throw new Error("Image not attached.");
      }

      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      setDownloadUUID(undefined);

      const formData = new FormData();
      formData.append("file", imageFile);
    
      const response = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData,
      });
    
      const result = await response.json();

      console.log("Received UUID: ", result?._uuid);

      if (result?.error) {
        setError(result.error);
      }

      if (result?._uuid) {
        setDownloadUUID(result._uuid);
        setSuccess("The file has been converted successfully!");
      }

      console.log("handleFileUpload() ended")
      setLoading(false);

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }

  };
  
  async function handleDownload() {
    
    try {
      
      if (!downloadUUID) {return}

      const response = await fetch(`http://127.0.0.1:5000/api/download/${downloadUUID}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      const filename = imageFile.name.split('.')[0] + ".midi";
      a.download = filename;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error downloading MIDI file:", error);
        alert(error.message);
    }
  }

  const restart = () => {
    setDownloadUUID(undefined);
    setSuccess(undefined);
    setError(undefined);
  }

  useEffect(() => {
    restart()
  }, [imageFile]);

  useEffect(() => {
    setSubmitable(!!imageFile && !loading);
  }, [imageFile, loading])



  return (
    <div className="flex items-center justify-center flex-col min-h-screen bg-slate-950 gap-4">
      
      {/* FORM */}
      <div className="border border-white border-dashed p-4 rounded-2xl bg-slate-800 flex justify-center items-center">
        <input type="file" className="disabled:cursor-not-allowed disabled:opacity-50" disabled={loading} onChange={(e) => setImageFile(e.target.files[0])} />
        <button 
          className={`${(!submitable) ? 'bg-slate-500' : 'bg-blue-500'} p-3 rounded-lg`}
          onClick={() => handleFileUpload()}
          disabled={(!submitable)}
        >
          Convert
        </button>
      </div>

      {loading && (<Spinner /> )}
      
      {downloadUUID && ( 
        
        <button 
          className="bg-blue-500 p-3 rounded-lg"
          onClick={() => handleDownload()}
        >
          Download
        </button>
      )}

      {error && (
        <p className="text-red-700">{error}</p>
      )}

      {success && (
        <p className="text-green-700">{success}</p>
      )}



    </div>
  );
}
