import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, Code2 } from "lucide-react";
import userimg from "../assets/pics/images (13).jpeg";
import { useNavigate, Link } from "react-router-dom";

export default function Myfollowingpost() {

  const [data, setData] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    fetch("/myfollowingpost", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.json())
      .then(result => setData(Array.isArray(result) ? result : []))
      .catch(err => console.log(err));
  }, [navigate]);

  const likepost = (id) => {
    fetch("/like", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then(res => res.json())
      .then(result => {
        setData(prev => prev.map(p => (p._id === result._id ? result : p)));
      });
  };

  const unlikepost = (id) => {
    fetch("/unlike", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id }),
    })
      .then(res => res.json())
      .then(result => {
        setData(prev => prev.map(p => (p._id === result._id ? result : p)));
      });
  };

  const makeComment = (text, id) => {
    if (!text?.trim()) return;

    fetch("/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ postId: id, text }),
    })
      .then(res => res.json())

      .then(updatedPost => {
        setData(prev => prev.map(p => (p._id === updatedPost._id ? updatedPost : p)));
        setCommentText(prev => ({ ...prev, [id]: "" }));
      });
  };

  return (
    <div className="pt-20 min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex justify-center">
      <div className="w-full max-w-xl px-3 space-y-6">

        {data.map(post => (
          <div
            key={post._id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
          >

            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <img src={post.postedBy?.Photo || userimg} alt="" className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover" />
              <div>
                <Link
                  to={`/profile/${post.postedBy?._id}`}
                  className="text-zinc-900 dark:text-white text-sm font-semibold hover:underline"
                >
                  {post.postedBy?.name || "Unknown"}
                </Link>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <Code2 size={12} /> Developer
                </p>
              </div>
            </div>

            {/* IMAGE */}
            <img
              src={post.photo}
              alt="post"
              className="w-full object-cover"
            />

            {/* ACTIONS */}
            <div className="px-4 py-3 space-y-3">
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                <div className="flex gap-5">
                  <Heart
                    onClick={() =>
                      post.likes?.includes(user._id)
                        ? unlikepost(post._id)
                        : likepost(post._id)
                    }
                    className={`cursor-pointer transition-transform hover:scale-110 ${
                      post.likes?.includes(user._id)
                        ? "text-red-500 fill-red-500"
                        : "hover:text-red-500"
                    }`}
                  />
                  <MessageCircle
                    className="cursor-pointer hover:text-zinc-900 dark:hover:text-white"
                    onClick={() =>
                      setOpenComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))
                    }
                  />
                  <Send className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" />
                </div>
                <Bookmark className="hover:text-zinc-900 dark:hover:text-white cursor-pointer" />
              </div>

              <p className="text-zinc-900 dark:text-white text-sm font-semibold">
                {post.likes?.length || 0} developers liked this
              </p>

              <p className="text-zinc-800 dark:text-zinc-300 text-sm leading-relaxed">
                <span className="text-zinc-900 dark:text-white font-semibold mr-1">
                  {post.postedBy?.name || "Unknown"}
                </span>
                {post.body}
              </p>
            </div>

            {/* COMMENTS */}
            {openComments[post._id] && (
              <div className="bg-zinc-50/70 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-4">

                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Comments
                </p>

                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {post.comments?.map((c) => (
                    <div key={c._id} className="flex gap-3 items-start group">
                      <img
                        src={c.postedBy?.Photo || userimg}
                        className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
                      />

                      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {c.postedBy?.name || "User"}
                          </p>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">now</span>
                        </div>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mt-0.5">
                          {c.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD COMMENT */}
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <img
                    src={user.Photo || userimg}
                    className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
                  />
                  <input
                    type="text"
                    value={commentText[post._id] || ""}
                    onChange={(e) =>
                      setCommentText(prev => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none border-b border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition pb-1"
                  />
                  <button
                    onClick={() => makeComment(commentText[post._id], post._id)}
                    className="text-zinc-900 dark:text-white text-sm font-semibold hover:underline"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}
