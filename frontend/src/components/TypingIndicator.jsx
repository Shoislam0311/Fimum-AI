import React from "react";
export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <span className="text-fimum font-bold">Fimum is typing…</span>
      <span className="text-lg">🤖</span>
    </div>
  );
}