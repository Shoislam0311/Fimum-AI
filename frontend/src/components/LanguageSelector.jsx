import React from "react";
export default function LanguageSelector({ lang, setLang }) {
  return (
    <select
      className="border px-2 py-1 rounded focus:ring-fimum focus:outline-none"
      value={lang}
      onChange={(e) => setLang(e.target.value)}
    >
      <option value="en">English</option>
      <option value="bn">বাংলা (Bengali)</option>
      <option value="hi">हिंदी (Hindi)</option>
    </select>
  );
}