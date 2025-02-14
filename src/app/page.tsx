"use client"

import React, { useState } from "react";
import { ChangeEvent } from "react";

export default function Home() {

  const [downloadUrl, setDownloadUrl] = useState<string|undefined>(undefined);

  const handleFileUpload = async (event: ChangeEvent) => {
    
    const input = event.target as HTMLInputElement;
  
    if (!input.files || input.files.length===0) {
      throw new Error("You must provide at least one image");
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("http://127.0.0.1:5000/api/upload", {
      method: "POST",
      body: formData,
    });
  
    const result = await response.json();

    if (result.downloadUrl) {
      setDownloadUrl(result.downloadUrl);
    }

    console.log(result);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <form>
        <input type="file" onChange={(e) => handleFileUpload(e)} />
        <input type="submit" className="bg-gray-500" />
      </form>
      
      {downloadUrl && <a href={downloadUrl}>Download</a>}
    </div>
  );
}
