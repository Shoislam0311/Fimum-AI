import React, { useRef, useState } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

export default function VoiceInput({ lang, onResult }) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  function start() {
    if (!("webkitSpeechRecognition" in window))
      return alert("Speech recognition not supported!");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang =
      lang === "bn" ? "bn-BD" : lang === "hi" ? "hi-IN" : "en-US";
    recognitionRef.current.onresult = (e) => {
      onResult(e.results[0][0].transcript);
      stop();
    };
    recognitionRef.current.start();
    setIsListening(true);
  }
  function stop() {
    recognitionRef.current && recognitionRef.current.stop();
    setIsListening(false);
  }
  return (
    <button
      className={`p-2 rounded ${
        isListening ? "bg-green-500" : "bg-gray-200"
      } text-white`}
      onClick={isListening ? stop : start}
      title="Speak"
    >
      {isListening ? <FaStop /> : <FaMicrophone />}
    </button>
  );
}