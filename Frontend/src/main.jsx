import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";
import { LoginProvider } from "./context/LoginContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LoginProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </LoginProvider>
    </BrowserRouter>
  </StrictMode>
);
