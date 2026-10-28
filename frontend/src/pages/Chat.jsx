import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import {
  ArrowUp,
  MessageSquare,
  MessageSquarePlus,
  PanelLeft,
  Sparkles,
  X
} from "lucide-react";

import API from "../api";

import {
  showError
} from "../utils/toast";

const SUGGESTIONS = [
  "Give me 5 streetwear design ideas",
  "Help me write a prompt for an anime hoodie design",
  "What makes a good matching couple t-shirt design?"
];

function formatDate(value) {

  if (!value) return "";

  const date = new Date(value);

  const today = new Date();

  const startOfDay = (d) =>
    new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).getTime();

  const diffDays = Math.round(
    (startOfDay(today) - startOfDay(date)) /
    86400000
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString(
    undefined,
    { day: "numeric", month: "short" }
  );
}

function TypingIndicator() {

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
        <Sparkles size={16} />
      </div>

      <div
        className="flex items-center gap-1.5 py-3"
        aria-label="AIWear assistant is typing"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-zinc-500"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function Message({ message }) {

  if (message.role === "user") {

    return (
      <div className="flex justify-end">
        <div
          className={`
            max-w-[85%]
            whitespace-pre-wrap
            rounded-2xl
            bg-[#2f2f2f]
            px-4
            py-2.5
            text-[15px]
            leading-6
            text-white
            [overflow-wrap:anywhere]
            ${message.pending ? "opacity-70" : ""}
          `}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
        <Sparkles size={16} />
      </div>

      <div className="min-w-0 flex-1 whitespace-pre-wrap pt-1 text-[15px] leading-7 text-zinc-100 [overflow-wrap:anywhere]">
        {message.content}
      </div>
    </div>
  );
}

export default function Chat() {

  const [sessions, setSessions] =
    useState([]);

  const [sessionsLoading, setSessionsLoading] =
    useState(true);

  const [sessionsError, setSessionsError] =
    useState(false);

  const [activeId, setActiveId] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [historyOpen, setHistoryOpen] =
    useState(false);

  const openRequest =
    useRef(0);

  const scrollRef =
    useRef(null);

  const textareaRef =
    useRef(null);


  // =====================================
  // LOAD SESSION LIST
  // =====================================

  const fetchSessions =
    useCallback(async () => {

      try {

        const res =
          await API.get("/chat/sessions");

        setSessions(
          res.data.sessions || []
        );

      } catch (err) {

        console.log(err);

        setSessionsError(true);

      } finally {

        setSessionsLoading(false);
      }
    }, []);

  // Initial load (loading flag already starts as true)
  useEffect(() => {

    const timer =
      setTimeout(fetchSessions, 0);

    return () =>
      clearTimeout(timer);

  }, [fetchSessions]);

  const retrySessions = () => {

    setSessionsLoading(true);
    setSessionsError(false);

    fetchSessions();
  };


  // =====================================
  // UI EFFECTS
  // =====================================

  // Keep the newest message in view
  useEffect(() => {

    const el = scrollRef.current;

    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth"
      });
    }

  }, [messages, sending, messagesLoading]);

  // Auto-grow textarea (max 160px)
  useEffect(() => {

    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";

    el.style.height =
      `${Math.min(el.scrollHeight, 160)}px`;

  }, [input]);

  // Escape closes the mobile history drawer
  useEffect(() => {

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setHistoryOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

  }, []);


  // =====================================
  // NEW CHAT / OPEN CHAT
  // =====================================

  const startNewChat =
    useCallback(() => {

      if (sending) return;

      openRequest.current += 1;

      setActiveId(null);
      setMessages([]);
      setMessagesLoading(false);
      setLoadError(false);
      setInput("");
      setHistoryOpen(false);

      textareaRef.current?.focus();

    }, [sending]);

  const openSession =
    useCallback(async (id) => {

      if (sending) return;

      setHistoryOpen(false);

      const requestId =
        ++openRequest.current;

      setActiveId(id);
      setMessages([]);
      setLoadError(false);
      setMessagesLoading(true);

      try {

        const res =
          await API.get(
            `/chat/sessions/${id}`
          );

        // A newer click happened while loading
        if (requestId !== openRequest.current) return;

        setMessages(
          res.data.session.messages || []
        );

      } catch (err) {

        if (requestId !== openRequest.current) return;

        console.log(err);

        if (err.response?.status === 404) {

          showError("That chat no longer exists");

          setSessions((prev) =>
            prev.filter((s) => s._id !== id)
          );

          setActiveId(null);

        } else {

          setLoadError(true);
        }

      } finally {

        if (requestId === openRequest.current) {
          setMessagesLoading(false);
        }
      }
    }, [sending]);


  // =====================================
  // SEND
  // =====================================

  const sendMessage =
    async (override) => {

      const text =
        (
          typeof override === "string"
            ? override
            : input
        ).trim();

      if (
        !text ||
        sending ||
        messagesLoading ||
        loadError
      ) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: text,
          pending: true
        }
      ]);

      setInput("");
      setSending(true);

      try {

        const res =
          await API.post(
            "/chat/message",
            {
              sessionId: activeId,
              message: text
            }
          );

        const { session, messages: saved } =
          res.data;

        setMessages((prev) => [
          ...prev.filter((m) => !m.pending),
          ...saved
        ]);

        setActiveId(session._id);

        setSessions((prev) => [
          {
            _id: session._id,
            title: session.title,
            updatedAt: session.updatedAt
          },
          ...prev.filter(
            (s) => s._id !== session._id
          )
        ]);

      } catch (err) {

        console.log(err);

        // Nothing was saved: undo the optimistic
        // message and give the text back.
        setMessages((prev) =>
          prev.filter((m) => !m.pending)
        );

        setInput(text);

        showError(
          err.response?.data?.error ||
          "Failed to send message"
        );

      } finally {

        setSending(false);

        textareaRef.current?.focus();
      }
    };

  const onKeyDown = (event) => {

    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    // On touch devices Enter inserts a new line
    if (
      window.matchMedia("(pointer: coarse)")
        .matches
    ) {
      return;
    }

    event.preventDefault();

    sendMessage();
  };


  // =====================================
  // RENDER
  // =====================================

  const activeTitle =
    sessions.find((s) => s._id === activeId)
      ?.title || "New chat";

  const showEmptyState =
    !messagesLoading &&
    !loadError &&
    messages.length === 0;

  const canSend =
    input.trim().length > 0 &&
    !sending &&
    !messagesLoading &&
    !loadError;

  return (

    <div className="relative flex h-dvh w-full overflow-hidden bg-[#171717] pt-14 text-white md:pt-0">

      {/* MOBILE BACKDROP */}
      {
        historyOpen && (
          <div
            onClick={() => setHistoryOpen(false)}
            className="absolute inset-x-0 bottom-0 top-14 z-20 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )
      }

      {/* HISTORY PANEL */}
      <aside
        className={`
          absolute
          bottom-0
          left-0
          top-14
          z-30
          flex
          w-72
          max-w-[85%]
          flex-col
          border-r
          border-[#2f2f2f]
          bg-[#0f0f0f]
          transition-transform
          duration-300
          md:static
          md:z-auto
          md:max-w-none
          md:shrink-0
          md:translate-x-0
          ${
            historyOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        <div className="flex items-center gap-2 p-3">

          <button
            onClick={startNewChat}
            disabled={sending}
            className="flex min-h-11 flex-1 items-center gap-2 rounded-2xl border border-[#2f2f2f] px-3 text-sm text-zinc-200 transition hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageSquarePlus size={18} />
            New chat
          </button>

          <button
            onClick={() => setHistoryOpen(false)}
            className="rounded-xl p-2 text-zinc-400 hover:bg-[#202020] md:hidden"
            aria-label="Close chat history"
          >
            <X size={20} />
          </button>
        </div>

        <p className="px-4 pb-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
          Recent chats
        </p>

        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3"
          aria-label="Chat history"
        >

          {
            sessionsLoading && (
              <div className="space-y-2 px-1 pt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-2xl bg-[#1a1a1a]"
                  />
                ))}
              </div>
            )
          }

          {
            !sessionsLoading &&
            sessionsError && (
              <div className="px-3 py-4 text-center text-sm text-zinc-500">
                <p>Couldn&apos;t load chats.</p>
                <button
                  onClick={retrySessions}
                  className="mt-2 text-cyan-300 hover:text-cyan-200"
                >
                  Try again
                </button>
              </div>
            )
          }

          {
            !sessionsLoading &&
            !sessionsError &&
            sessions.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-zinc-500">
                No conversations yet. Say hello to start one.
              </p>
            )
          }

          {
            !sessionsLoading &&
            sessions.map((s) => {

              const active =
                s._id === activeId;

              return (
                <button
                  key={s._id}
                  onClick={() => openSession(s._id)}
                  disabled={sending && !active}
                  aria-current={active ? "true" : undefined}
                  className={`
                    flex
                    min-h-11
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-3
                    py-2
                    text-left
                    text-sm
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    ${
                      active
                        ? "bg-[#2f2f2f] text-white"
                        : "text-zinc-400 hover:bg-[#202020] hover:text-white"
                    }
                  `}
                >
                  <MessageSquare
                    size={16}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate">
                      {s.title}
                    </span>
                    <span className="block text-xs text-zinc-600">
                      {formatDate(s.updatedAt)}
                    </span>
                  </span>
                </button>
              );
            })
          }
        </nav>
      </aside>

      {/* CHAT COLUMN */}
      <section className="flex min-w-0 flex-1 flex-col">

        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#2f2f2f] px-3">

          <button
            onClick={() => setHistoryOpen(true)}
            className="rounded-xl p-2 text-zinc-300 hover:bg-[#202020] md:hidden"
            aria-label="Open chat history"
          >
            <PanelLeft size={20} />
          </button>

          <h1 className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-200">
            {activeTitle}
          </h1>

          <button
            onClick={startNewChat}
            disabled={sending}
            className="rounded-xl p-2 text-zinc-300 hover:bg-[#202020] disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
            aria-label="New chat"
          >
            <MessageSquarePlus size={20} />
          </button>
        </header>

        {/* MESSAGES */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >

          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-6">

            {
              messagesLoading && (
                <div className="space-y-6">
                  <div className="ml-auto h-10 w-2/3 animate-pulse rounded-2xl bg-[#202020]" />
                  <div className="h-20 w-full animate-pulse rounded-2xl bg-[#1a1a1a]" />
                  <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-[#202020]" />
                </div>
              )
            }

            {
              loadError && (
                <div className="m-auto text-center">
                  <p className="text-sm text-zinc-400">
                    Couldn&apos;t load this conversation.
                  </p>
                  <button
                    onClick={() => openSession(activeId)}
                    className="mt-3 rounded-xl border border-[#2f2f2f] px-4 py-2 text-sm text-cyan-300 hover:bg-[#202020]"
                  >
                    Try again
                  </button>
                </div>
              )
            }

            {
              showEmptyState && (
                <div className="m-auto flex w-full max-w-xl flex-col items-center text-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                    <Sparkles size={24} />
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                    How can I help?
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Ask about design ideas, prompts, or anything else.
                  </p>

                  <div className="mt-6 grid w-full gap-2">
                    {SUGGESTIONS.map((text) => (
                      <button
                        key={text}
                        onClick={() => sendMessage(text)}
                        disabled={sending}
                        className="min-h-11 rounded-2xl border border-[#2f2f2f] px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-[#202020] disabled:opacity-50"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }

            {
              messages.map((m, i) => (
                <Message
                  key={`${m.createdAt || "p"}-${i}`}
                  message={m}
                />
              ))
            }

            {sending && <TypingIndicator />}
          </div>
        </div>

        {/* COMPOSER */}
        <div className="shrink-0 border-t border-[#2f2f2f] bg-[#171717] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">

          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={4000}
              placeholder="Message AIWear assistant"
              aria-label="Message"
              className="max-h-40 min-h-12 min-w-0 flex-1 resize-none rounded-2xl border border-[#2f2f2f] bg-[#202020] px-4 py-3 text-[15px] leading-6 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/60"
            />

            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp size={20} />
            </button>
          </div>

          <p className="mx-auto mt-2 hidden max-w-3xl text-center text-xs text-zinc-600 sm:block">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </section>
    </div>
  );
}
