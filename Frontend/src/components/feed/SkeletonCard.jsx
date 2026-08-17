import React from "react";

export default function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="avatar-sm bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
      <div className="h-60 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  );
}
