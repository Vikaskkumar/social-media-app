import React from "react";
import { Sparkles } from "lucide-react";

const AVATAR_FALLBACK = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export default function SuggestionsSidebar({
  suggestions = [],
  followedNow,
  onFollowUser,
  onOpenUser,
}) {
  if (!suggestions.length) return null;

  return (
    <aside className="hidden lg:block lg:col-span-4 sticky top-24 h-fit">
      <div className="card p-4 space-y-3">
        <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} />
          Suggested for you
        </h3>
        <div className="space-y-2.5">
          {suggestions.map((user) => {
            const followed = followedNow.has(user._id);
            return (
              <div key={user._id} className="flex items-center gap-2.5">
                <img
                  src={user.Photo || AVATAR_FALLBACK}
                  onError={(e) => { e.target.src = AVATAR_FALLBACK; }}
                  alt=""
                  onClick={() => onOpenUser(user._id)}
                  className="avatar-xs"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onOpenUser(user._id)}
                >
                  <p className="text-xs font-semibold hover:underline truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    @{user.userName || "developer"}
                  </p>
                </div>
                <button
                  onClick={() => !followed && onFollowUser(user._id)}
                  disabled={followed}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                    followed
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-default"
                      : "btn-primary"
                  }`}
                >
                  {followed ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
