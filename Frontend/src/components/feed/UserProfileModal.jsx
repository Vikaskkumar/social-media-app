import React from "react";
import { X } from "lucide-react";
import UserProfile from "../UserProfile";

export default function UserProfileModal({ userId, onClose }) {
  if (!userId) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl h-[85vh] card flex flex-col overflow-hidden shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer border border-zinc-200 dark:border-zinc-700"
          aria-label="Close user profile"
        >
          <X size={16} />
        </button>
        <div className="flex-1 overflow-y-auto">
          <UserProfile userid={userId} />
        </div>
      </div>
    </div>
  );
}
