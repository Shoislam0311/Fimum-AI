import React, { useRef, useState } from "react";
import { FaFileUpload } from "react-icons/fa";

export default function FileUpload({ user, onUploaded }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  async function handleFile(e) {
    if (!user) return alert("Login first to upload!");
    setUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setFileUrl(data.file_url);
    setUploading(false);
    onUploaded && onUploaded(data.file_url);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        title="Attach file"
        onClick={() => inputRef.current.click()}
      >
        <FaFileUpload />
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf,text/*"
        onChange={handleFile}
      />
      {uploading && <span className="text-xs text-blue-500">Uploading…</span>}
      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener"
          className="text-xs underline text-green-700"
        >
          Uploaded!
        </a>
      )}
    </div>
  );
}