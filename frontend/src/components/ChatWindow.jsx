import React, { useState, useRef } from "react";
import VoiceInput from "./VoiceInput";
import TypingIndicator from "./TypingIndicator";
import FileUpload from "./FileUpload";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";

export default function ChatWindow({
  user,
  prefs,
  lang,
  chatHistory,
  setChatHistory,
  selectedChat,
  showError,
}) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);

  const messages =
    selectedChat !== null
      ? [chatHistory[selectedChat]]
      : chatHistory.slice(0, 30).reverse();

  async function sendMessage(msg) {
    if (!user) return showError("Please login!");
    setTyping(true);
    const formData = new FormData();
    formData.append("prompt", msg);
    formData.append("user_id", user.id);
    formData.append("lang", lang);
    if (fileUrl) formData.append("file_url", fileUrl);
    const res = await fetch("/api/chat", { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) {
      showError(data.error);
      setTyping(false);
      return;
    }
    setChatHistory((old) => [...old, { prompt: msg, answer: data.answer }]);
    setInput("");
    setTyping(false);
    setFileUrl(null);
    speak(data.answer, lang);
  }

  function speak(text, lang) {
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang === "bn" ? "bn-BD" : lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function onEmojiClick(e, emojiObj) {
    setInput((i) => i + (emojiObj.emoji || e.emoji));
    setShowEmojis(false);
  }

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-white to-gray-50">
        {messages.map(
          (msg, i) =>
            msg && (
              <div key={i}>
                <MessageBubble
                  type="user"
                  text={msg.prompt}
                  timestamp={msg.created_at}
                />
                <MessageBubble
                  type="ai"
                  text={msg.answer}
                  timestamp={msg.created_at}
                />
              </div>
            )
        )}
        {typing && <TypingIndicator />}
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2 p-4 border-t bg-gray-50">
        <div className="flex flex-1 items-center gap-2">
          <button
            className="p-2 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setShowEmojis((v) => !v)}
            title="Insert emoji"
          >
            😊
          </button>
          {showEmojis && (
            <div className="absolute bottom-20 left-8 z-10">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          <input
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fimum"
            placeholder="Type your message here…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) sendMessage(input);
            }}
          />
          <VoiceInput lang={lang} onResult={setInput} />
          <FileUpload user={user} onUploaded={setFileUrl} />
          <button
            className="bg-fimum text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            disabled={!input.trim()}
            onClick={() => sendMessage(input)}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}