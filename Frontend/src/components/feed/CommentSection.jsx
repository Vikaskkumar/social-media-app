import React from "react";

const AVATAR_FALLBACK = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export default function CommentSection({
  comments = [],
  commentText = "",
  setCommentText,
  postComment,
  setOpenUser,
}) {
  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/50">
      {comments.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2 items-start">
              <img
                src={c.postedBy?.Photo || AVATAR_FALLBACK}
                onError={(e) => { e.target.src = AVATAR_FALLBACK; }}
                alt=""
                className="avatar-xs shrink-0 mt-0.5"
              />
              <div className="card rounded-xl px-3 py-1.5 flex-1">
                <p
                  onClick={() => c.postedBy?._id && setOpenUser(c.postedBy._id)}
                  className="text-[11px] font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline"
                >
                  {c.postedBy?.name || "User"}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                  {c.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              postComment();
            }
          }}
          placeholder="Add a comment… (Enter to send)"
          className="input-box flex-1"
        />
        <button
          onClick={postComment}
          disabled={!commentText.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>
    </div>
  );
}
