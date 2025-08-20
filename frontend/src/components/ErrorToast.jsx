import React from "react";
export default function ErrorToast({ error }) {
  if (!error) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold">
        {error}
      </div>
    </div>
  );
}