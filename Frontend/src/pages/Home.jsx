import React from "react";
import Feed from "./Feed";
import Sidebar from "./Sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 ml-16 min-h-screen">
        <Feed />
      </main>
    </div>
  );
}