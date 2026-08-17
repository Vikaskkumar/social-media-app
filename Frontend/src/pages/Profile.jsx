import React, { useContext, useEffect, useState, useMemo } from "react";
import PostDetails from "../components/PostDetails";
import ProfilePic from "../components/ProfilePic";
import profilepic from "../assets/pics/images (13).jpeg";
import { LoginContext } from "../context/LoginContext";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [changePic, setChangePic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' | 'saved' | 'tagged'
  const [viewMode, setViewMode] = useState("grid3"); // 'grid3' | 'grid4' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  const { setuserLogin } = useContext(LoginContext);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const headers = { Authorization: "Bearer " + localStorage.getItem("jwt") };
        const [postsResponse, profileResponse] = await Promise.all([
          fetch("/myposts", { headers }),
          fetch("/myprofile", { headers }),
        ]);
        const [postsData, profileData] = await Promise.all([
          postsResponse.json(),
          profileResponse.json(),
        ]);

        if (!postsResponse.ok || !profileResponse.ok) {
          throw new Error(postsData.error || profileData.error || "Unable to load profile");
        }
        if (!cancelled) {
          setPosts(Array.isArray(postsData) ? postsData : []);
          setUser(profileData);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user");
          setuserLogin(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [setuserLogin]);

  // Filter posts based on search input
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter(
      (post) =>
        post.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.caption?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300 font-sans">

      {/* Share Toast */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg text-xs font-medium text-zinc-900 dark:text-white animate-bounce">
          <CheckIcon className="w-4 h-4 text-emerald-400" />
          Profile link copied to clipboard!
        </div>
      )}

      <div className="relative z-10 pt-20 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Card Header */}
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Avatar Container */}
              <div className="relative group cursor-pointer border border-zinc-200 dark:border-zinc-800 rounded-full overflow-hidden" onClick={() => setChangePic(true)}>
                <img
                  src={user?.Photo || profilepic}
                  alt="profile"
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-medium gap-1">
                  <CameraIcon className="w-5 h-5 text-zinc-300" />
                  <span>Update</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      {user?.name || "Developer"}
                      <span className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                        <SparklesIcon className="w-4 h-4" />
                      </span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium mt-0.5 flex items-center justify-center sm:justify-start gap-3">
                      <span>Full-stack Engineer</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-350 dark:bg-zinc-700" />
                      <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                        <MapPinIcon className="w-3 h-3" /> San Francisco, CA
                      </span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChangePic(true)}
                      className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <button
                      onClick={handleCopyShareLink}
                      className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl transition border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      title="Share Profile"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tech Skill Badges */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                  {["React", "Node.js", "TypeScript", "Tailwind"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-805 flex justify-center sm:justify-start gap-8">
                  <StatItem label="posts" value={posts.length} />
                  <StatItem label="followers" value={user?.followers?.length || 0} />
                  <StatItem label="following" value={user?.following?.length || 0} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab & Grid Switcher Bar */}
        <div className="mt-10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: "posts", label: "Posts", Icon: GridIcon },
              { id: "saved", label: "Saved", Icon: BookmarkIcon },
              { id: "tagged", label: "Tagged", Icon: UserTagIcon },
            ].map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative flex-1 sm:w-48">
              <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-550" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none transition"
              />
            </div>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("grid3")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "grid3" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-500"
                  }`}
                title="3 Column Grid"
              >
                <GridIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid4")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "grid4" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-500"
                  }`}
                title="4 Column Grid"
              >
                <LayoutGridIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" : "text-zinc-500"
                  }`}
                title="List View"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Posts Layout View */}
        {isLoading ? (
          <GridSkeleton viewMode={viewMode} />
        ) : activeTab !== "posts" ? (
          <EmptyTabState tab={activeTab} />
        ) : filteredPosts.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <div
            className={
              viewMode === "grid4"
                ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
                : viewMode === "list"
                  ? "flex flex-col gap-4 max-w-xl mx-auto"
                  : "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
            }
          >
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => setSelectedPost(post)}
                className={`group relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer ${viewMode === "list" ? "aspect-video" : "aspect-square"
                  }`}
              >
                <img
                  src={post.photo}
                  alt="post"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                  <p className="text-xs text-zinc-200 line-clamp-1 mb-2 font-medium">
                    {post.body || post.caption || "View post details"}
                  </p>
                  <div className="flex items-center gap-4 text-white font-semibold">
                    <div className="flex items-center gap-1.5 text-xs text-rose-400">
                      <HeartIcon className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <MessageCircleIcon className="w-3.5 h-3.5 fill-zinc-400" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Component Modals */}
        {selectedPost && (
          <PostDetails post={selectedPost} close={() => setSelectedPost(null)} setPosts={setPosts} />
        )}
        {changePic && (
          <ProfilePic close={() => setChangePic(false)} onSaved={setUser} />
        )}
      </div>
    </div>
  );
}

// Subcomponents
function StatItem({ value, label }) {
  return (
    <div className="flex items-baseline gap-1.5 text-xs sm:text-sm">
      <span className="font-extrabold text-zinc-900 dark:text-white text-base sm:text-lg">{value}</span>
      <span className="text-zinc-500 dark:text-zinc-400 capitalize text-xs">{label}</span>
    </div>
  );
}

function EmptyState({ searchQuery }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
        <GridIcon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">
        {searchQuery ? `No posts matching "${searchQuery}"` : "No posts published yet"}
      </h3>
      <p className="text-xs text-zinc-500 max-w-xs">
        {searchQuery ? "Try searching for a different keyword." : "Share your first photo to fill your grid."}
      </p>
    </div>
  );
}

function EmptyTabState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
        {tab === "saved" ? <BookmarkIcon className="w-8 h-8" /> : <UserTagIcon className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 capitalize">No {tab} content</h3>
      <p className="text-xs text-zinc-500 max-w-xs">Items you save or photos you are tagged in will show up here.</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <div className="h-32 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-4 w-full">
          <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto sm:mx-0" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg mx-auto sm:mx-0" />
          <div className="flex justify-center sm:justify-start gap-6 pt-2">
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GridSkeleton({ viewMode }) {
  const cols = viewMode === "grid4" ? 8 : 6;
  return (
    <div
      className={
        viewMode === "grid4"
          ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
          : "grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
      }
    >
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="aspect-square bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

// Lightweight Inline SVG Icons (Zero Dependencies)
const CameraIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" /></svg>;
const GridIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const LayoutGridIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM15 5a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM15 15a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" /></svg>;
const ListIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const HeartIcon = (p) => <svg {...p} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const MessageCircleIcon = (p) => <svg {...p} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const SettingsIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>;
const ShareIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>;
const SparklesIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const MapPinIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>;
const CheckIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const SearchIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const BookmarkIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>;
const UserTagIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;