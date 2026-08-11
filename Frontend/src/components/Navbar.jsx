import React, { useContext, useState } from "react";
import logo from "../assets/mainlogo.png";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { Menu, MessageCircle, X, Sun, Moon } from "lucide-react";

function Navbar({ login }) {
  const { setmodalOpen, theme, toggleTheme } = useContext(LoginContext);
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("jwt");
  const isLoggedIn = login || token;

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="
        fixed top-0 left-0 w-full z-50
        backdrop-blur-md border-b
        bg-white/80 border-zinc-200
        dark:bg-black/60 dark:border-cyan-500/10
        transition-colors duration-300
      ">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6 md:px-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="StarkNet logo"
              className="h-9 object-contain bg-white p-1 rounded-lg shadow-[0_0_16px_rgba(0,243,255,0.35)]"
            />
            <p className="font-extrabold text-xl tracking-wide text-cyan-600 dark:text-cyan-300">
              Stark<span className="text-zinc-800 dark:text-white">Net</span>
            </p>
          </Link>

          {/* Right-side action buttons */}
          <div className="flex items-center gap-2">

            {/* ── THEME TOGGLE ─────── */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle light / dark theme"
              className="
                relative grid h-10 w-10 place-items-center rounded-xl
                border transition-all duration-300 cursor-pointer
                border-zinc-300 bg-zinc-100 text-zinc-600
                hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600
                dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300
                dark:hover:border-cyan-400 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-300
              "
            >
              {/* Animated icon swap */}
              <span
                className={`absolute transition-all duration-300 ${
                  theme === "dark"
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 rotate-90 scale-50"
                }`}
              >
                <Sun size={19} />
              </span>
              <span
                className={`absolute transition-all duration-300 ${
                  theme === "light"
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-50"
                }`}
              >
                <Moon size={19} />
              </span>
            </button>

            {/* Chat link (logged-in only) */}
            {isLoggedIn && (
              <Link
                to="/Chat"
                title="Open chat"
                aria-label="Open chat"
                className="
                  grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200
                  border-zinc-300 bg-zinc-100 text-zinc-600
                  hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600
                  dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300
                  dark:hover:border-cyan-400 dark:hover:bg-cyan-400/10 dark:hover:text-white
                "
              >
                <MessageCircle size={20} />
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="
                grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200 cursor-pointer
                border-zinc-300 bg-zinc-100 text-zinc-600
                hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-600
                dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300
                dark:hover:border-cyan-400 dark:hover:bg-cyan-400/10 dark:hover:text-white
              "
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── OVERLAY ─────────────────────────────────────────── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 backdrop-blur-sm transition-all"
        />
      )}

      {/* ── SIDEBAR DRAWER ──────────────────────────────────── */}
      <div
        className={`
          fixed top-0 right-0 h-full w-72 z-50
          flex flex-col
          border-l transition-all duration-300 ease-in-out
          bg-white border-zinc-200
          dark:bg-zinc-950 dark:border-zinc-800
          ${open ? "translate-x-0 shadow-2xl" : "translate-x-full"}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold text-lg">Menu</span>
            {/* Inline theme badge */}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
              theme === "dark"
                ? "bg-zinc-800 text-zinc-400"
                : "bg-zinc-100 text-zinc-500"
            }`}>
              {theme}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col p-5 gap-1 flex-1">
          {isLoggedIn ? (
            <>
              {[
                { to: "/", label: "Home" },
                { to: "/Profile", label: "Profile" },
                { to: "/CreatePost", label: "Create Post" },
                { to: "/Chat", label: "Chat" },
                { to: "/followingpost", label: "Following Posts" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="
                    px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200
                    text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100
                    dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800
                  "
                >
                  {label}
                </Link>
              ))}

              {/* Theme toggle in sidebar */}
              <button
                onClick={toggleTheme}
                className="
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer mt-1
                  text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100
                  dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800
                "
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                Switch to {theme === "dark" ? "light" : "dark"} mode
              </button>

              <div className="flex-1" />

              {/* Logout */}
              <button
                onClick={() => {
                  setOpen(false);
                  setmodalOpen(true);
                }}
                className="
                  mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer
                  text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-red-200
                  dark:text-red-400 dark:hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 dark:border-red-400/30
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/Signup"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/Signin"
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}

export default Navbar;
