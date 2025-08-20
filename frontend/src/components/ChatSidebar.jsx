import React from "react";
import { FaTrash, FaHistory, FaCommentDots } from "react-icons/fa";

export default function ChatSidebar({ chatHistory, selectedChat, onSelect, onClear }) {
  return (
    <aside className="w-20 md:w-72 bg-gradient-to-b from-gray-100 to-gray-200 border-r flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-bold text-lg flex items-center gap-2">
          <FaCommentDots /> <span className="hidden md:inline">Chats</span>
        </span>
        <button
          className="text-red-500 hover:text-red-700"
          title="Clear chat"
          onClick={onClear}
        >
          <FaTrash />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatHistory && chatHistory.length > 0 ? (
          chatHistory.map((c, i) => (
            <div
              key={c.id || i}
              className={`px-4 py-3 cursor-pointer hover:bg-indigo-50 border-b transition-all ${
                selectedChat === i ? "bg-indigo-100" : ""
              }`}
              onClick={() => onSelect(i)}
            >
              <div className="text-xs text-gray-500 truncate">{c.prompt}</div>
              <div className="text-sm font-medium truncate">{c.answer?.slice(0, 40)}...</div>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-400">No chats yet. Start a conversation!</div>
        )}
      </div>
      <div className="h-8"></div>
    </aside>
  );
}