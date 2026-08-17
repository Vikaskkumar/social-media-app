import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import SkeletonCard from "../components/feed/SkeletonCard";
import EmptyFeed from "../components/feed/EmptyFeed";
import PostCard from "../components/feed/PostCard";
import SuggestionsSidebar from "../components/feed/SuggestionsSidebar";
import UserProfileModal from "../components/feed/UserProfileModal";

export default function Feed() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [openUser, setOpenUser] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [followedNow, setFollowedNow] = useState(new Set());

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


  /* ── fetch my profile ── */
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token || !me?._id) return;
    fetch(`/user/${me._id}`, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json())
      .then(res => { if (res.user) setUserProfile(res.user); })
      .catch(() => { });
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
      }).catch(() => { });
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


  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── FEED MAIN COLUMN ── */}
        <main className="lg:col-span-8 space-y-4">
          {loading ? (
            <>{[1, 2, 3].map(n => <SkeletonCard key={n} />)}</>
          ) : data.length === 0 ? (
            <EmptyFeed />
          ) : (
            data.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={me._id}
                isBookmarked={bookmarked[post._id]}
                showComments={openComments[post._id]}
                commentText={commentText[post._id] || ""}
                onLike={likePost}
                onUnlike={unlikePost}
                onToggleComments={(id, forceOpen) => setOpenComments(p => ({ ...p, [id]: forceOpen ?? !p[id] }))}
                onToggleBookmark={toggleBookmark}
                onCommentTextChange={(val) => setCommentText(p => ({ ...p, [post._id]: val }))}
                onPostComment={() => postComment(commentText[post._id], post._id)}
                onOpenUser={setOpenUser}
              />
            ))
          )}
        </main>


        {/* ── RIGHT SIDEBAR ── */}
        <SuggestionsSidebar
          suggestions={suggestions}
          followedNow={followedNow}
          onFollowUser={followUser}
          onOpenUser={setOpenUser}
        />

      </div>

      {/* ── USER PROFILE MODAL ── */}
      <UserProfileModal userId={openUser} onClose={() => setOpenUser(null)} />
    </div>
  );
}
