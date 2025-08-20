import React from "react";
import { FaRobot, FaUser } from "react-icons/fa";

export default function MessageBubble({ type, text, timestamp }) {
  const isUser = type === "user";
  return (
    <div
      className={`flex items-end ${
        isUser ? "justify-end" : "justify-start"
      } gap-2`}
    >
      {!isUser && (
        <span className="bg-indigo-100 rounded-full p-2">
          <FaRobot className="text-fimum" />
        </span>
      )}
      <div
        className={`relative px-5 py-3 rounded-2xl shadow-sm max-w-[70vw] whitespace-pre-line text-base leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        {text}
      </div>
      {isUser && (
        <span className="bg-indigo-600 text-white rounded-full p-2">
          <FaUser />
        </span>
      )}
    </div>
  );
}