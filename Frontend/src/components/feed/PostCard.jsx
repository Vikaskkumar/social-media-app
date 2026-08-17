import React from "react";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import CommentSection from "./CommentSection";

const AVATAR_FALLBACK = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

export default function PostCard({
  post,
  currentUserId,
  isBookmarked,
  showComments,
  commentText,
  onLike,
  onUnlike,
  onToggleComments,
  onToggleBookmark,
  onCommentTextChange,
  onPostComment,
  onOpenUser,
}) {
  const liked = post.likes?.includes(currentUserId);

  return (
    <article className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
        <img
          src={post.postedBy?.Photo || AVATAR_FALLBACK}
          onError={(e) => { e.target.src = AVATAR_FALLBACK; }}
          alt=""
          onClick={() => post.postedBy?._id && onOpenUser(post.postedBy._id)}
          className="avatar-sm"
        />
        <div className="flex-1 min-w-0">
          <p
            onClick={() => post.postedBy?._id && onOpenUser(post.postedBy._id)}
            className="text-xs font-bold hover:underline cursor-pointer truncate"
          >
            {post.postedBy?.name || "Unknown"}
          </p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Developer</p>
        </div>
      </div>

      {/* Photo */}
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-950">
        <img src={post.photo} alt="post" className="w-full h-full object-cover" />
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (liked ? onUnlike(post._id) : onLike(post._id))}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Heart
              size={20}
              className={`transition ${liked ? "fill-red-500 text-red-500" : "btn-icon hover:text-red-500"}`}
            />
            {(post.likes?.length ?? 0) > 0 && (
              <span className="text-xs font-semibold text-zinc-500">{post.likes.length}</span>
            )}
          </button>

          <button
            onClick={() => onToggleComments(post._id)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle
              size={20}
              className={`transition ${showComments ? "text-zinc-900 dark:text-white" : "btn-icon"}`}
            />
            {(post.comments?.length ?? 0) > 0 && (
              <span className="text-xs font-semibold text-zinc-500">{post.comments.length}</span>
            )}
          </button>

          <button className="cursor-pointer">
            <Send size={20} className="btn-icon" />
          </button>
        </div>

        <button onClick={() => onToggleBookmark(post._id)} className="cursor-pointer">
          <Bookmark
            size={20}
            className={`transition ${isBookmarked ? "fill-zinc-900 text-zinc-900 dark:fill-white dark:text-white" : "btn-icon"}`}
          />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3 space-y-1">
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <span
            onClick={() => post.postedBy?._id && onOpenUser(post.postedBy._id)}
            className="font-bold text-zinc-900 dark:text-white mr-1.5 cursor-pointer hover:underline"
          >
            {post.postedBy?.name || "Unknown"}
          </span>
          {post.body}
        </p>
        {(post.comments?.length ?? 0) > 0 && !showComments && (
          <button
            onClick={() => onToggleComments(post._id, true)}
            className="text-[11px] text-zinc-400 hover:underline cursor-pointer"
          >
            View all {post.comments.length} comments
          </button>
        )}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <CommentSection
          comments={post.comments}
          commentText={commentText}
          setCommentText={onCommentTextChange}
          postComment={onPostComment}
          setOpenUser={onOpenUser}
        />
      )}
    </article>
  );
}
