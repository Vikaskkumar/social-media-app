import React, { useEffect, useState } from "react";
import PostDetails from "../components/PostDetails";
import profilepic from "../assets/pics/images (13).jpeg";
import { useParams } from "react-router-dom";

export default function UserProfile({ userid }) {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { userid: routeUserId } = useParams();
  const profileId = userid || routeUserId;

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id;

  useEffect(() => {
    if (!profileId) return;

    fetch(`/user/${profileId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Unable to load profile");
        return result;
      })
      .then(result => {
        setUser(result.user);
        setPosts(Array.isArray(result.posts) ? result.posts : []);
        setFollowing(result.user.followers?.includes(currentUserId));
      })
      .catch(console.log);
  }, [profileId, currentUserId]);

  if (!profileId) return null;
  if (!user) return null;

  const followUser = () => {
    fetch("/follow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: profileId }),
    })
      .then(res => res.json())
      .then(() => {
        setFollowing(true);
        setUser(prev => ({
          ...prev,
          followers: [...(prev.followers || []), currentUser._id],
        }));
      });
  };

  const unfollowUser = () => {
    fetch("/unfollow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: profileId }),
    })
      .then(res => res.json())
      .then(() => {
        setFollowing(false);
        setUser(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(
            id => id !== currentUser._id
          ),
        }));
      });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="pt-10 max-w-5xl mx-auto px-4">

        {/* PROFILE */}
        <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <img
            src={user.Photo || profilepic}
            alt=""
            className="h-28 w-28 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Full-stack Developer</p>

            <div className="flex gap-6 mt-3 text-sm">
              <p><span className="font-semibold text-zinc-900 dark:text-white">{posts.length}</span> posts</p>
              <p><span className="font-semibold text-zinc-900 dark:text-white">{user.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold text-zinc-900 dark:text-white">{user.following?.length || 0}</span> following</p>
            </div>
          </div>

          {currentUser._id !== user._id && (
            following ? (
              <button
                onClick={unfollowUser}
                className="px-4 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Following
              </button>
            ) : (
              <button
                onClick={followUser}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Follow
              </button>
            )
          )}
        </div>

        {/* POSTS */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {posts.map(post => (
            <img
              key={post._id}
              src={post.photo}
              onClick={() => setSelectedPost(post)}
              alt="post"
              className="aspect-square object-cover cursor-pointer border border-zinc-200 dark:border-zinc-800 rounded-lg"
            />
          ))}
        </div>
      </div>
      {selectedPost && (
        <PostDetails
          post={selectedPost}
          close={() => setSelectedPost(null)}
          setPosts={setPosts}
          showDelete={currentUser._id === user._id}
        />
      )}
    </div>
  );
}
