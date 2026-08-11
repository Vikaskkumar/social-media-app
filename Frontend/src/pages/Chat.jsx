import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, Search, Send, UserRound } from "lucide-react";

import { useChat } from "../context/ChatContext";
import { useLogin } from "../context/LoginContext";

const getApiUrl = (path) => {
  if (window.location.port === "5173") {
    return `http://localhost:5000${path}`;
  }

  return path;
};

const getId = (value) => (typeof value === "object" ? value?._id : value);

const getPhotoUrl = (photo) => {
  if (!photo) {
    return "";
  }

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  return getApiUrl(photo.startsWith("/") ? photo : `/${photo}`);
};

function Avatar({ user, size = "h-10 w-10" }) {
  const photoUrl = getPhotoUrl(user?.Photo);

  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-full border border-cyan-400/30 bg-zinc-900 flex items-center justify-center`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserRound size={18} className="text-cyan-300" />
      )}
    </div>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-zinc-400">
      <div className="mb-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-300">
        <MessageCircle size={34} />
      </div>
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6">{copy}</p>
    </div>
  );
}

export default function Chat() {
  const { user, token } = useLogin();
  const {
    messages,
    setMessages,
    activeConversation,
    setActiveConversation,
    typingUsers,
    socketError,
    setSocketError,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChat();

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const currentUserId = user?._id;

  const otherParticipant = (conversation) =>
    conversation?.participants?.find((participant) => getId(participant) !== currentUserId);

  const activeUser = otherParticipant(activeConversation);
  const isTyping = activeUser?._id && typingUsers.includes(activeUser._id);

  const filteredUsers = users.filter((chatUser) => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return true;
    }

    return [chatUser.name, chatUser.userName, chatUser.email]
      .filter(Boolean)
      .some((item) => item.toLowerCase().includes(term));
  });

  const updateConversation = (conversation) => {
    setConversations((prev) => {
      const next = prev.filter((item) => item._id !== conversation._id);
      return [conversation, ...next];
    });
  };

  const requestJson = useCallback(async (path, options = {}) => {
    const response = await fetch(getApiUrl(path), {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Chat request failed");
    }

    return data;
  }, [authHeaders]);

  useEffect(() => {
    let ignore = false;

    const loadChat = async () => {
      setLoading(true);
      setError("");

      try {
        const [conversationData, userData] = await Promise.all([
          requestJson("/chat/conversations"),
          requestJson("/chat/users"),
        ]);

        if (!ignore) {
          setConversations(conversationData);
          setUsers(userData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load chat");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadChat();
    }

    return () => {
      ignore = true;
    };
  }, [token, requestJson]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    setSocketError("");
    setMessagesLoading(true);
    setError("");

    try {
      const messageData = await requestJson(
        `/chat/conversations/${conversation._id}/messages`
      );
      setMessages(messageData);
      updateConversation(conversation);
    } catch (err) {
      setError(err.message || "Unable to load messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const startConversation = async (chatUser) => {
    setError("");

    try {
      const conversation = await requestJson("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({ userId: chatUser._id }),
      });

      await openConversation(conversation);
    } catch (err) {
      setError(err.message || "Unable to start conversation");
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setText(value);

    if (!activeConversation?._id) {
      return;
    }

    if (value.trim()) {
      startTyping(activeConversation._id);
      window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        stopTyping(activeConversation._id);
      }, 1200);
    } else {
      stopTyping(activeConversation._id);
    }
  };

  const handleSend = () => {
    if (!activeConversation?._id || !text.trim()) {
      return;
    }

    sendMessage({
      conversationId: activeConversation._id,
      text,
    });
    setText("");
    stopTyping(activeConversation._id);
  };

  return (
    <main className="min-h-screen bg-[#02070a] px-4 pb-8 pt-24 text-white sm:px-6">
      <section className="mx-auto grid h-[calc(100vh-8rem)] max-w-7xl overflow-hidden rounded-lg border border-cyan-400/20 bg-black/50 shadow-[0_0_40px_rgba(0,255,255,0.08)] md:grid-cols-[22rem_1fr]">
        <aside className="flex min-h-0 flex-col border-b border-cyan-400/10 bg-[#071012] md:border-b-0 md:border-r">
          <div className="border-b border-cyan-400/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-cyan-400 p-2 text-black">
                <MessageCircle size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-cyan-300">Chat</h1>
                <p className="text-xs text-zinc-400">Messages with StarkNet users</p>
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-md border border-cyan-400/20 bg-black/40 px-3 py-2 text-sm text-zinc-300">
              <Search size={16} className="text-cyan-300" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-zinc-500"
                placeholder="Search users"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex h-36 items-center justify-center text-cyan-300">
                <LoaderCircle size={24} className="animate-spin" />
              </div>
            ) : (
              <>
                {conversations.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-2 px-1 text-xs font-semibold uppercase text-zinc-500">
                      Recent
                    </p>
                    <div className="space-y-2">
                      {conversations.map((conversation) => {
                        const participant = otherParticipant(conversation);
                        const active = conversation._id === activeConversation?._id;

                        return (
                          <button
                            key={conversation._id}
                            onClick={() => openConversation(conversation)}
                            className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition ${
                              active
                                ? "border-cyan-400/60 bg-cyan-400/15"
                                : "border-transparent hover:border-cyan-400/20 hover:bg-white/5"
                            }`}
                          >
                            <Avatar user={participant} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {participant?.name || participant?.userName || "User"}
                              </p>
                              <p className="truncate text-xs text-zinc-400">
                                @{participant?.userName || "starknet"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 px-1 text-xs font-semibold uppercase text-zinc-500">
                    Start a Chat
                  </p>
                  <div className="space-y-2">
                    {filteredUsers.map((chatUser) => (
                      <button
                        key={chatUser._id}
                        onClick={() => startConversation(chatUser)}
                        className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left transition hover:border-cyan-400/20 hover:bg-white/5"
                      >
                        <Avatar user={chatUser} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {chatUser.name || chatUser.userName}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            @{chatUser.userName}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="px-1 py-6 text-center text-sm text-zinc-500">
                        No users found
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          {activeConversation ? (
            <>
              <div className="flex items-center gap-3 border-b border-cyan-400/10 bg-[#071012] px-5 py-4">
                <Avatar user={activeUser} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {activeUser?.name || activeUser?.userName || "Conversation"}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {isTyping ? "typing..." : `@${activeUser?.userName || "starknet"}`}
                  </p>
                </div>
              </div>

              {(error || socketError) && (
                <div className="border-b border-red-400/20 bg-red-500/10 px-5 py-2 text-sm text-red-300">
                  {error || socketError}
                </div>
              )}

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-cyan-300">
                    <LoaderCircle size={28} className="animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <EmptyState
                    title="No messages yet"
                    copy="Send the first message and this conversation will update live."
                  />
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const senderId = getId(message.sender);
                      const mine = senderId === currentUserId;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-lg px-4 py-2 text-sm leading-6 ${
                              mine
                                ? "bg-cyan-400 text-black"
                                : "border border-cyan-400/15 bg-white/5 text-zinc-100"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-cyan-400/10 bg-[#071012] p-4">
                <div className="flex items-center gap-3">
                  <input
                    value={text}
                    onChange={handleChange}
                    onBlur={() => stopTyping(activeConversation._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    className="min-w-0 flex-1 rounded-md border border-cyan-400/20 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-cyan-400 text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Send message"
                  >
                    <Send size={19} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Choose a conversation"
              copy="Pick a recent chat or select a user from the sidebar to start messaging."
            />
          )}
        </section>
      </section>
    </main>
  );
}
