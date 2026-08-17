import React, { useEffect, useState } from "react";
import profilepic from "../assets/pics/images (13).jpeg";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/debcictpi/image/upload";
const MAX_CAPTION_LENGTH = 500;

export default function CreatePost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [location, setLocation] = useState("");
  const [aspectRatio, setAspectRatio] = useState("square"); // 'square' | 'portrait' | 'landscape'

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImage(file);
      } else {
        toast.error("Please drop a valid image file");
      }
    }
  };

  const addHashtag = (tag) => {
    if (body.length + tag.length + 2 <= MAX_CAPTION_LENGTH) {
      setBody((prev) => (prev ? `${prev} ${tag}` : tag));
    }
  };

  const postData = async () => {
    if (!image) {
      toast.error("Please select an image before publishing");
      return;
    }
    if (!body.trim()) {
      toast.error("Add a caption to complete your post");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", image);
      uploadData.append("upload_preset", "starknet");

      const uploadResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: uploadData,
      });
      const uploadResult = await uploadResponse.json();
      const imageUrl = uploadResult.secure_url || uploadResult.url;
      if (!uploadResponse.ok || !imageUrl) {
        throw new Error(uploadResult.error?.message || "Image upload failed");
      }

      const response = await fetch("/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ body: body.trim(), pic: imageUrl, location }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to create post");
      }

      toast.success("Post published to feed!");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Unable to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic aspect ratio styling
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    landscape: "aspect-video",
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300">
      {/* Container - Split Studio Viewport */}
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">

        {/* LEFT COLUMN: Media Canvas & Preview Controls (7 cols) */}
        <div className="md:col-span-7 bg-zinc-50/50 dark:bg-zinc-900/40 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between relative min-h-[420px]">

          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between mb-4 z-10">
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4" /> Discard
            </button>

            {/* Aspect Ratio Selector Pills */}
            {previewUrl && (
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setAspectRatio("square")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${aspectRatio === "square" ? "bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                >
                  1:1
                </button>
                <button
                  onClick={() => setAspectRatio("portrait")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${aspectRatio === "portrait" ? "bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                >
                  4:5
                </button>
                <button
                  onClick={() => setAspectRatio("landscape")}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${aspectRatio === "landscape" ? "bg-zinc-150 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                >
                  16:9
                </button>
              </div>
            )}
          </div>

          {/* Canvas / Drag & Drop Stage */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full my-auto rounded-xl overflow-hidden border transition-all duration-300 flex items-center justify-center ${isDragging
              ? "border-zinc-400 bg-zinc-200/20 dark:border-zinc-650 dark:bg-zinc-800/20 scale-[0.99]"
              : previewUrl
                ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                : "border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20"
              }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />

            {previewUrl ? (
              <div className={`w-full max-h-[460px] ${aspectClasses[aspectRatio]} transition-all duration-300 relative group flex items-center justify-center overflow-hidden`}>
                <img
                  src={previewUrl}
                  alt="Post canvas preview"
                  className="w-full h-full object-cover"
                />

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-30">
                  <label className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition">
                    Replace Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setImage(null)}
                    className="p-2 bg-rose-550 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition cursor-pointer"
                    title="Remove Image"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 px-6 text-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-500">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Drag media here or <span className="text-zinc-900 dark:text-white underline">browse</span>
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">High resolution JPG, PNG or WEBP</p>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Footer Bar */}
          <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : "No media selected"}</span>
            <span className="uppercase">{aspectRatio} view</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata & Publishing Inspector (5 cols) */}
        <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6">

          {/* Creator Profile Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.Photo || profilepic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
              />
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                  {currentUser.name || "You"}
                </h4>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Creator
                </span>
              </div>
            </div>

            <button
              onClick={postData}
              disabled={isSubmitting || !image || !body.trim()}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish</span>
              )}
            </button>
          </div>

          {/* Caption Input Section */}
          <div className="space-y-3 flex-1 flex flex-col">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-450 uppercase tracking-wider">
              Caption
            </label>
            <div className="relative flex-1">
              <textarea
                placeholder="What's on your mind? Add story context or tags..."
                value={body}
                maxLength={MAX_CAPTION_LENGTH}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-full min-h-[140px] bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-xl p-4 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none resize-none transition"
              />
              <span className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-500 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                {body.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>

            {/* Quick Hashtag Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["#photography", "#art", "#web3", "#starknet"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => addHashtag(tag)}
                  className="text-[11px] text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Post Settings */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/85">
            {/* Location Tag */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-450 block mb-1.5">
                Location Tag
              </label>
              <div className="relative">
                <MapPinIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. Tokyo, Japan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-450 dark:focus:border-zinc-600 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 outline-none transition"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Inline SVGs (No external dependencies)
const ArrowLeftIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ImageIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const TrashIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MapPinIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

const SpinnerIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);