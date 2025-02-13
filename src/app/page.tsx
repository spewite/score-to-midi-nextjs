"use client"

import { ChangeEvent } from "react";

export default function Home() {

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
    console.log(result);
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <input type="file" onChange={(e) => handleFileUpload(e)} />
    </div>
  );
}
