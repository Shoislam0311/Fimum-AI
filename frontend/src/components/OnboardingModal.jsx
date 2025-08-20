import React from "react";
import logo from "../assets/logo.svg";

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Fimum" className="h-14" />
          <h2 className="text-2xl font-bold mb-2 text-fimum">Welcome to Fimum!</h2>
          <p className="text-gray-500 mb-4 text-center">
            Your personal AI assistant. Type or speak your questions, upload images or files, select your preferred language, and let Fimum handle everything!
          </p>
          <button
            className="bg-fimum text-white px-5 py-2 rounded-full font-semibold"
            onClick={onClose}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}