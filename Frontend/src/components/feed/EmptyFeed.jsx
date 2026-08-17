import React from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmptyFeed() {
  const navigate = useNavigate();

  return (
    <div className="card p-12 text-center flex flex-col items-center gap-3">
      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        <Sparkles size={24} />
      </div>
      <div>
        <h3 className="font-bold">Feed is empty</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Be the first to share something with the community.
        </p>
      </div>
      <button onClick={() => navigate("/CreatePost")} className="btn-primary mt-2">
        Create first post
      </button>
    </div>
  );
}
