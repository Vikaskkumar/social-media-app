import React, { useContext, useState } from "react";
import signuplogo from "../assets/signup.jpg";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginContext } from "../context/LoginContext";

export default function Signin() {
  const context = useContext(LoginContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!context) {
    throw new Error(
      "LoginContext is missing. Make sure LoginProvider wraps the app."
    );
  }

  const { login } = context;

  console.log("LoginContext:", context);
  console.log("login =", login);
  console.log("typeof login =", typeof login);

  const postData = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password) {
      toast.error("Password is required");
      return;
    }

    if (typeof login !== "function") {
      console.error(
        "ERROR: login is not a function",
        context
      );

      toast.error("Login function not found");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/signin", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      console.log("Signin response:", data);

      if (!response.ok || data.success !== true) {
        toast.error(
          data.message ||
            data.error ||
            "Login failed"
        );

        return;
      }

      // Your backend returns both user and token
      if (!data.user || !data.token) {
        console.error(
          "Invalid login response:",
          data
        );

        toast.error(
          "Invalid login response from server"
        );

        return;
      }

      // IMPORTANT
      login(data.user, data.token);

      toast.success(
        data.message || "Login successful"
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Signin error:", error);

      toast.error(
        error?.message ||
          "Unable to connect to the server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-300">
      <div className="relative z-10 w-96 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-6">
          Welcome Back
        </h1>

        <form
          autoComplete="off"
          className="space-y-4"
          onSubmit={postData}
        >
          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Email"
            disabled={loading}
            autoComplete="email"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition disabled:opacity-50"
          />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Password"
            disabled={loading}
            autoComplete="current-password"
            className="w-full px-4 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition disabled:opacity-50"
          />

          <div className="text-right text-xs text-zinc-550 dark:text-zinc-450 hover:underline transition cursor-pointer">
            Forgot password?
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-5">
          Don't have an account?{" "}

          <Link
            to="/Signup"
            className="text-zinc-900 dark:text-white hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}