import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import profilepic from "../assets/pics/images (13).jpeg";

export default function Sidebar() {
    const [isHovered, setIsHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const navItems = [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Profile", path: "/profile", icon: ProfileIcon },
        { name: "Create Post", path: "/CreatePost", icon: PlusIcon },
        { name: "Following Posts", path: "/followingpost", icon: HeartIcon },
    ];


    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`fixed top-0 left-0 h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out z-50 flex flex-col justify-between py-5 px-3 select-none overflow-hidden ${isHovered ? "w-64 shadow-lg" : "w-16"
                }`}
        >
            {/* Top Header / Logo Section */}
            <div className="w-full">
                {/* Collapsed Logo */}
                {!isHovered ? (
                    <div className="flex justify-center mb-8">
                        <NavLink
                            to="/"
                            className="p-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition duration-200"
                            title="Instagram"
                        >
                            <InstagramIcon className="w-6 h-6" />
                        </NavLink>
                    </div>
                ) : (
                    /* Expanded Menu Header (Matches Screenshot) */
                    <div className="flex items-center justify-between px-2 pb-4 mb-3 border-b border-zinc-200 dark:border-zinc-800 transition-opacity duration-200 opacity-100">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight">Menu</span>
                            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700/60 uppercase">
                                {isDarkMode ? "DARK" : "LIGHT"}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsHovered(false)}
                            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Navigation Items */}
                <nav className="flex flex-col gap-1.5 w-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3.5 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive
                                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    } ${!isHovered ? "justify-center px-0" : ""}`
                                }
                                title={!isHovered ? item.name : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isHovered && (
                                    <span className="truncate transition-opacity duration-200 opacity-100">
                                        {item.name}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>


        </aside>
    );
}

// Inline SVGs

const InstagramIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const HomeIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
    </svg>
);

const ProfileIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const PlusIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
    </svg>
);

const DirectIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M22 3L2 10.5l8 2.5 2.5 8L22 3z" />
    </svg>
);

const HeartIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
);

const SunIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
        <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
        <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
        <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
    </svg>
);

const CloseIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);