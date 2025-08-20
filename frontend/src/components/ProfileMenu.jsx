import React, { useState } from "react";

export default function ProfileMenu({ user, prefs, setPrefs, showError }) {
  const [show, setShow] = useState(false);
  const [goal, setGoal] = useState(prefs.goal || "");
  const [tone, setTone] = useState(prefs.tone || "friendly");

  async function savePrefs() {
    if (!user) return showError("Login to save preferences!");
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("prefs", JSON.stringify({ goal, tone }));
    await fetch("/api/prefs", { method: "POST", body: formData });
    setPrefs({ goal, tone });
    setShow(false);
  }

  return (
    <div className="relative">
      <button
        className="bg-gray-200 px-3 py-1 rounded text-sm"
        onClick={() => setShow((v) => !v)}
      >
        Profile & Settings
      </button>
      {show && (
        <div className="absolute right-0 mt-2 w-60 bg-white border shadow-lg rounded-lg p-4 z-20">
          <div>
            <label className="block text-xs font-semibold">Goal</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mt-1 mb-2"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. build AI empire"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold">Tone</label>
            <select
              className="w-full border rounded px-2 py-1 mt-1 mb-2"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="friendly">Friendly</option>
              <option value="blunt">Blunt</option>
              <option value="benglish">Benglish</option>
            </select>
          </div>
          <button
            className="w-full bg-fimum text-white rounded px-3 py-1 mt-2"
            onClick={savePrefs}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}