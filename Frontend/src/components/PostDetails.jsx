import React from "react";

export default function PostDetails({ post, close, setPosts, showDelete = true }) {

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `/deletepost/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
        }
      );

      if (res.ok) {
        setPosts(prevPosts => prevPosts.filter(p => p._id !== post._id));
        close();
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // safety: if no post, render nothing
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-all">

      {/* backdrop */}
      <div
        className="absolute inset-0"
        onClick={close}
      />

      {/* modal */}
      <div className="relative flex w-[90%] max-w-4xl overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl">

        {/* image */}
        <div className="w-1/2 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
          <img
            src={post.photo}
            alt="post"
            className="h-full w-full object-contain"
          />
        </div>

        {/* details */}
        <div className="flex w-1/2 flex-col p-6 text-zinc-900 dark:text-zinc-50">

          {/* header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="font-bold text-zinc-900 dark:text-white">{post.postedBy?.name || "Unknown"}</h2>
            <button
              onClick={close}
              className="text-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* caption */}
          <p className="mt-4 text-zinc-650 dark:text-zinc-300 text-sm leading-relaxed">{post.body}</p>

          {/* likes */}
          <p className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {post.likes.length} likes
          </p>

          {/* delete */}
          {showDelete && (
            <button
              onClick={handleDelete}
              className="mt-auto rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 transition cursor-pointer"
            >
              Delete Post
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
