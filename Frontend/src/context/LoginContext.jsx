import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  connectSocket,
  disconnectSocket,
} from "../socket";

export const LoginContext = createContext(null);

export const LoginProvider = ({ children }) => {
  // -----------------------------
  // User
  // -----------------------------
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error(
        "Error loading user from localStorage:",
        error
      );

      return null;
    }
  });

  // -----------------------------
  // JWT Token
  // -----------------------------
  const [token, setToken] = useState(() => {
    return localStorage.getItem("jwt") || null;
  });

  // -----------------------------
  // Login status
  // -----------------------------
  const [userLogin, setUserLogin] = useState(() => {
    return Boolean(localStorage.getItem("jwt"));
  });

  // -----------------------------
  // Logout confirmation modal
  // -----------------------------
  const [modalOpen, setModalOpen] = useState(false);

  // -----------------------------
  // Socket connection
  // -----------------------------
  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = (userData, jwtToken) => {
    console.log("login() called");
    console.log("userData:", userData);
    console.log("jwtToken:", jwtToken);

    if (!jwtToken) {
      console.error("Login failed: JWT token is missing");
      return false;
    }

    // Save token
    localStorage.setItem("jwt", jwtToken);

    // Save user if available
    if (userData) {
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setUser(userData);
    }

    // Update state
    setToken(jwtToken);
    setUserLogin(true);

    return true;
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = () => {
    console.log("logout() called");

    disconnectSocket();

    localStorage.removeItem("jwt");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
    setUserLogin(false);
  };

  // -----------------------------
  // CONTEXT VALUE
  // -----------------------------
  const value = {
    userLogin,
    setUserLogin,

    modalOpen,
    setmodalOpen: setModalOpen,

    user,
    setUser,

    token,
    setToken,

    login,
    logout,
  };

  console.log("LoginContext:", value);

  return (
    <LoginContext.Provider value={value}>
      {children}
    </LoginContext.Provider>
  );
};

// Optional helper hook
export const useLogin = () => {
  const context = useContext(LoginContext);

  if (!context) {
    throw new Error(
      "useLogin must be used inside LoginProvider"
    );
  }

  return context;
};
