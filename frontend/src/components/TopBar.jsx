import React from "react";
import logo from "../assets/logo.svg";
import { FaRobot } from "react-icons/fa";

export default function TopBar({ user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow">
      <div className="flex items-center gap-2">
        <img src={logo} alt="Fimum" className="h-8 w-8" />
        <span className="font-bold text-xl tracking-wider">Fimum</span>
        <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded">
          powered by STN – all models 34B params
        </span>
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm">{user.email}</span>
          <button
            className="bg-white text-fimum rounded px-3 py-1 font-semibold hover:bg-blue-100"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <span className="text-sm italic">Not logged in</span>
      )}
    </header>
  );
}