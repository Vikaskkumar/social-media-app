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
    <div
      className="relative min-h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${signuplogo})`,
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-96 p-8 bg-black/80 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.25)]">
        <h1 className="text-2xl font-bold text-center text-cyan-300 mb-6">
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
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition disabled:opacity-50"
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
            className="w-full px-4 py-2 rounded-lg bg-black/60 text-white outline-none border border-cyan-500/20 focus:border-cyan-400 transition disabled:opacity-50"
          />

          <div className="text-right text-xs text-gray-400 hover:text-cyan-400 transition cursor-pointer">
            Forgot password?
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          Don't have an account?{" "}

          <Link
            to="/Signup"
            className="text-cyan-300 hover:text-cyan-400"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}