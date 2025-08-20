import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import TopBar from "./components/TopBar";
import ChatWindow from "./components/ChatWindow";
import ChatSidebar from "./components/ChatSidebar";
import LanguageSelector from "./components/LanguageSelector";
import ProfileMenu from "./components/ProfileMenu";
import OnboardingModal from "./components/OnboardingModal";
import ErrorToast from "./components/ErrorToast";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [lang, setLang] = useState("en");
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPrefs(session.user.id);
      else setShowOnboarding(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPrefs(session.user.id);
      else setShowOnboarding(true);
    });
    return () => listener?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user)
      fetch("/api/history?user_id=" + user.id)
        .then((r) => r.json())
        .then((d) => setChatHistory(d.history));
  }, [user]);

  function fetchPrefs(user_id) {
    fetch("/api/prefs?user_id=" + user_id)
      .then((r) => r.json())
      .then((d) => setPrefs(d));
  }

  function showError(msg) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  return (
    <div className="h-screen flex flex-col">
      <TopBar user={user} onLogout={() => supabase.auth.signOut()} />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          chatHistory={chatHistory}
          selectedChat={selectedChat}
          onSelect={setSelectedChat}
          onClear={() => setChatHistory([])}
        />
        <div className="flex-1 flex flex-col bg-white md:rounded-tl-3xl shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <LanguageSelector lang={lang} setLang={setLang} />
            <ProfileMenu user={user} prefs={prefs} setPrefs={setPrefs} showError={showError} />
          </div>
          <ChatWindow
            user={user}
            prefs={prefs}
            lang={lang}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            selectedChat={selectedChat}
            showError={showError}
          />
        </div>
      </div>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <ErrorToast error={error} />
    </div>
  );
}
