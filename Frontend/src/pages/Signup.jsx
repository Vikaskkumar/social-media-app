import React, { useState } from "react";
import signuplogo from "../assets/signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const notifyError = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const postData = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    

    if (!name || !userName || !email || !password) {
      notifyError("All fields are required");
      return;
    }

    if (!emailRegex.test(email)) {
      notifyError("Invalid email address");
      return;
    }

   
    fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        userName,
        email,
        password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          notifyError(data.error);
        } else {
          notifySuccess(data.message || "Account created successfully");
          navigate("/signin");
        }
      })
      .catch(() => notifyError("Something went wrong"));
  };

  return (
    <div className="relative min-h-screen w-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-300">
      <div className="relative z-10 w-96 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-6">
          Create Account
        </h1>

        <form autoComplete="off" className="space-y-4">
          <input
            type="text"
            name="name_fake"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />

          <input
            type="text"
            name="username_fake"
            autoComplete="off"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />

          <input
            type="email"
            name="email_fake"
            autoComplete="new-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />

          <input
            type="password"
            name="password_fake"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />

          <button
            type="button"
            onClick={postData}
            className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold transition cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-5">
          Already have an account?{" "}
          <Link to="/Signin" className="text-zinc-900 dark:text-white hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
