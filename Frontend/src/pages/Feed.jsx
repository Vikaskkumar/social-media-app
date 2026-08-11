import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Heart, MessageCircle, Send, Bookmark, X, Sparkles, UserPlus } from "lucide-react";
import UserProfile from "../components/UserProfile";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

/* ─────────────────────────────────────────────────────────── */
const AVATAR_FALLBACK = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/4" />
        </div>
      </div>
      <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/2" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
export default function Feed() {
  const [data, setData]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [userProfile, setUserProfile]       = useState(null);
  const [openUser, setOpenUser]             = useState(null);
  const [openComments, setOpenComments]     = useState({});
  const [commentText, setCommentText]       = useState({});
  const [bookmarked, setBookmarked]         = useState({});
  const [followedNow, setFollowedNow]       = useState(new Set());

  const navigate = useNavigate();
  const { setuserLogin } = useContext(LoginContext);

  const me = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  }, []);

  /* ── fetch all posts ── */
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) { navigate("/Signin"); return; }

    setLoading(true);
    fetch("/allposts", { headers: { Authorization: "Bearer " + token } })
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed");
        setData(Array.isArray(json) ? json : []);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setuserLogin(false);
        navigate("/Signin", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate, setuserLogin]);

  /* ── fetch my profile (for suggestions filter) ── */
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token || !me?._id) return;
    fetch(`/user/${me._id}`, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(res => { if (res.user) setUserProfile(res.user); })
      .catch(() => {});
  }, [me?._id]);

  /* ── actions ── */
  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("jwt"),
  });

  const likePost = useCallback(id => {
    fetch("/like", { method: "PUT", headers: authHeaders(), body: JSON.stringify({ postId: id }) })
      .then(r => r.json()).then(res => setData(p => p.map(x => x._id === res._id ? res : x)));
  }, []);

  const unlikePost = useCallback(id => {
    fetch("/unlike", { method: "PUT", headers: authHeaders(), body: JSON.stringify({ postId: id }) })
      .then(r => r.json()).then(res => setData(p => p.map(x => x._id === res._id ? res : x)));
  }, []);

  const postComment = useCallback((text, id) => {
    if (!text?.trim()) return;
    fetch("/comment", { method: "PUT", headers: authHeaders(), body: JSON.stringify({ postId: id, text: text.trim() }) })
      .then(r => r.json()).then(res => {
        setData(p => p.map(x => x._id === res._id ? res : x));
        setCommentText(p => ({ ...p, [id]: "" }));
      });
  }, []);

  const followUser = useCallback(id => {
    fetch("/follow", { method: "PUT", headers: authHeaders(), body: JSON.stringify({ followId: id }) })
      .then(r => r.json()).then(() => {
        setFollowedNow(prev => new Set([...prev, id]));
        setUserProfile(prev => prev ? { ...prev, following: [...(prev.following || []), id] } : prev);
      }).catch(() => {});
  }, []);

  const toggleBookmark = useCallback(id => {
    setBookmarked(p => ({ ...p, [id]: !p[id] }));
  }, []);

  /* ── suggested users ── */
  const suggestions = useMemo(() => {
    if (!data.length) return [];
    const seen = new Set();
    const following = new Set([
      ...(userProfile?.following || me?.following || []),
      ...followedNow,
    ]);
    return data.reduce((acc, post) => {
      const a = post.postedBy;
      if (a && a._id !== me._id && !following.has(a._id) && !seen.has(a._id)) {
        seen.add(a._id);
        acc.push(a);
      }
      return acc;
    }, []).slice(0, 5);
  }, [data, userProfile, me._id, followedNow]);

  /* ══ RENDER ══ */
  return (
    <div className="min-h-screen pt-24 pb-16 px-3 md:px-4 bg-slate-50 dark:bg-[#0a0a0f] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10
        bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.05),transparent)]
        dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.11),transparent)]" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── FEED (center) ── */}
        <main className="col-span-1 lg:col-span-8 space-y-5">

          {loading ? (
            <>{[1, 2, 3].map(n => <SkeletonCard key={n} />)}</>

          ) : data.length === 0 ? (
            <div className="rounded-2xl border p-14 flex flex-col items-center gap-4 text-center bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-cyan-50 dark:bg-cyan-400/10 text-cyan-600 dark:text-cyan-400">
                <Sparkles size={30} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Feed is empty</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Be the first to share something with the community.</p>
              </div>
              <button
                onClick={() => navigate("/CreatePost")}
                className="mt-1 px-6 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                Create first post
              </button>
            </div>

          ) : data.map(post => {
            const liked        = post.likes?.includes(me._id);
            const isBookmarked = bookmarked[post._id];
            const showComments = openComments[post._id];

            return (
              <article
                key={post._id}
                className="rounded-2xl border overflow-hidden transition-all duration-200 bg-white border-zinc-200 shadow-sm hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => post.postedBy?._id && setOpenUser(post.postedBy._id)}
                  >
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 opacity-0 hover:opacity-40 blur transition duration-300" />
                    <img
                      src={post.postedBy?.Photo || AVATAR_FALLBACK}
                      onError={e => { e.target.src = AVATAR_FALLBACK; }}
                      alt=""
                      className="relative h-9 w-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      onClick={() => post.postedBy?._id && setOpenUser(post.postedBy._id)}
                      className="text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition truncate"
                    >
                      {post.postedBy?.name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Developer</p>
                  </div>
                </div>

                {/* Image */}
                <div className="overflow-hidden group aspect-square bg-zinc-100 dark:bg-zinc-950">
                  <img
                    src={post.photo}
                    alt="post"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                {/* Action bar */}
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => liked ? unlikePost(post._id) : likePost(post._id)}
                      aria-label={liked ? "Unlike" : "Like"}
                      className="flex items-center gap-1.5 group/btn"
                    >
                      <Heart size={21} className={`transition-all duration-200 group-hover/btn:scale-110 active:scale-90 ${liked ? "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" : "text-zinc-400 dark:text-zinc-500 group-hover/btn:text-red-500"}`} />
                      {(post.likes?.length ?? 0) > 0 && <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{post.likes.length}</span>}
                    </button>

                    <button
                      onClick={() => setOpenComments(p => ({ ...p, [post._id]: !p[post._id] }))}
                      aria-label="Comments"
                      className="flex items-center gap-1.5 group/btn"
                    >
                      <MessageCircle size={21} className={`transition-all duration-200 group-hover/btn:scale-110 active:scale-90 ${showComments ? "text-cyan-500 dark:text-cyan-400 fill-cyan-500/10" : "text-zinc-400 dark:text-zinc-500 group-hover/btn:text-cyan-500 dark:group-hover/btn:text-cyan-400"}`} />
                      {(post.comments?.length ?? 0) > 0 && <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{post.comments.length}</span>}
                    </button>

                    <button aria-label="Share" className="group/btn">
                      <Send size={21} className="text-zinc-400 dark:text-zinc-500 transition-all duration-200 group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400 group-hover/btn:scale-110 active:scale-90" />
                    </button>
                  </div>

                  <button onClick={() => toggleBookmark(post._id)} aria-label="Bookmark" className="group/btn">
                    <Bookmark size={21} className={`transition-all duration-200 group-hover/btn:scale-110 active:scale-90 ${isBookmarked ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]" : "text-zinc-400 dark:text-zinc-500 group-hover/btn:text-amber-400"}`} />
                  </button>
                </div>

                {/* Caption */}
                <div className="px-4 pb-4 pt-2 space-y-1">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <span
                      onClick={() => post.postedBy?._id && setOpenUser(post.postedBy._id)}
                      className="font-semibold text-zinc-900 dark:text-white mr-1.5 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                    >
                      {post.postedBy?.name || "Unknown"}
                    </span>
                    {post.body}
                  </p>
                  {(post.comments?.length ?? 0) > 0 && !showComments && (
                    <button
                      onClick={() => setOpenComments(p => ({ ...p, [post._id]: true }))}
                      className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>

                {/* Comments panel */}
                {showComments && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-4 space-y-3 bg-zinc-50/70 dark:bg-zinc-950/50">
                    {post.comments?.length > 0 && (
                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-0.5">
                        {post.comments.map(c => (
                          <div key={c._id} className="flex gap-2.5">
                            <img
                              src={c.postedBy?.Photo || AVATAR_FALLBACK}
                              onError={e => { e.target.src = AVATAR_FALLBACK; }}
                              alt=""
                              className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5 border border-zinc-200 dark:border-zinc-800"
                            />
                            <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3 py-2">
                              <p
                                onClick={() => c.postedBy?._id && setOpenUser(c.postedBy._id)}
                                className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                              >
                                {c.postedBy?.name || "User"}
                              </p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">{c.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commentText[post._id] || ""}
                        onChange={e => setCommentText(p => ({ ...p, [post._id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(commentText[post._id], post._id); }
                        }}
                        placeholder="Add a comment… (Enter to send)"
                        className="flex-1 text-xs px-4 py-2.5 rounded-xl outline-none transition bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-cyan-500"
                      />
                      <button
                        onClick={() => postComment(commentText[post._id], post._id)}
                        disabled={!commentText[post._id]?.trim()}
                        className="px-4 rounded-xl text-xs font-bold transition cursor-pointer bg-cyan-500 hover:bg-cyan-400 text-black disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </main>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-24 h-fit">
          {suggestions.length > 0 && (
            <div className="rounded-2xl border p-5 space-y-4 bg-white border-zinc-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={13} className="text-cyan-500 dark:text-cyan-400" />
                Suggested for you
              </h3>
              <div className="space-y-3">
                {suggestions.map(user => {
                  const followed = followedNow.has(user._id);
                  return (
                    <div key={user._id} className="flex items-center gap-3">
                      <img
                        src={user.Photo || AVATAR_FALLBACK}
                        onError={e => { e.target.src = AVATAR_FALLBACK; }}
                        alt=""
                        onClick={() => setOpenUser(user._id)}
                        className="h-9 w-9 rounded-full object-cover cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:ring-2 hover:ring-cyan-500 transition"
                      />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpenUser(user._id)}>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate hover:text-cyan-600 dark:hover:text-cyan-400 transition">{user.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">@{user.userName || "developer"}</p>
                      </div>
                      <button
                        onClick={() => !followed && followUser(user._id)}
                        disabled={followed}
                        className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${followed ? "bg-zinc-100 text-zinc-400 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700 cursor-default" : "bg-cyan-500 hover:bg-cyan-400 text-black"}`}
                      >
                        {followed ? "Following" : <><UserPlus size={11} />Follow</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

      </div>

      {/* User profile modal */}
      {openUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setOpenUser(null)}
        >
          <div className="relative w-full max-w-3xl h-[90vh] rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-2xl dark:bg-zinc-950 dark:border-zinc-800 flex flex-col">
            <button
              onClick={() => setOpenUser(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-xl transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="flex-1 overflow-y-auto">
              <UserProfile userid={openUser} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
