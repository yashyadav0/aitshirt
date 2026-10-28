const express =
  require("express");

const mongoose =
  require("mongoose");

const axios =
  require("axios");

const ChatSession =
  require("../models/ChatSession");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


// =====================================
// LIMITS
// =====================================

// Only the most recent messages are sent to Gemini.
// The full history is still stored in MongoDB for display.
const MAX_CONTEXT_MESSAGES =
  Number(process.env.CHAT_CONTEXT_MESSAGES) || 10;

const MAX_CONTEXT_CHARS = 12000;

const MAX_MESSAGE_CHARS = 4000;

const MAX_SESSION_MESSAGES = 200;

const MAX_SESSIONS_LISTED = 50;

const CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ||
  "gemini-2.5-flash";

const SYSTEM_PROMPT =
  "You are the AIWear assistant, a friendly and concise helper inside an AI apparel " +
  "customization store. Help with design ideas, writing prompts for the design " +
  "generator, and general questions. Do not invent store policies, prices, stock, " +
  "or order details; if you are unsure, say so. Keep answers clear and well organized.";


// =====================================
// HELPERS
// =====================================

class ChatError extends Error {

  constructor(status, message) {

    super(message);

    this.status = status;
  }
}


function makeTitle(text) {

  const clean =
    text.replace(/\s+/g, " ").trim();

  return clean.length > 50
    ? `${clean.slice(0, 50).trimEnd()}…`
    : clean;
}


// Builds the limited context window:
// last N messages, trimmed oldest-first to a character budget,
// starting with a user turn, roles strictly alternating.
function buildContext(history, newMessage) {

  let window =
    [
      ...history,
      {
        role: "user",
        content: newMessage
      }
    ].slice(-MAX_CONTEXT_MESSAGES);

  let total =
    window.reduce(
      (sum, m) => sum + m.content.length,
      0
    );

  while (
    window.length > 1 &&
    total > MAX_CONTEXT_CHARS
  ) {

    total -= window[0].content.length;

    window = window.slice(1);
  }

  while (
    window.length > 1 &&
    window[0].role !== "user"
  ) {

    window = window.slice(1);
  }

  const contents = [];

  for (const m of window) {

    const role =
      m.role === "assistant"
        ? "model"
        : "user";

    const last =
      contents[contents.length - 1];

    if (last && last.role === role) {

      last.parts[0].text +=
        `\n\n${m.content}`;

    } else {

      contents.push({
        role,
        parts: [{ text: m.content }]
      });
    }
  }

  return contents;
}


async function askGemini(contents) {

  if (!process.env.GEMINI_API_KEY) {

    throw new ChatError(
      503,
      "Chat is not configured on the server."
    );
  }

  let response;

  try {

    response =
      await axios.post(

        `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,

        {
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },

          contents,

          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        },

        {
          timeout: 45000
        }
      );

  } catch (err) {

    // Never log err.config: its URL contains the API key.
    console.log(
      "CHAT GEMINI ERROR:",
      err.response?.data || err.message
    );

    if (err.code === "ECONNABORTED") {
      throw new ChatError(
        504,
        "The AI took too long to respond. Please try again."
      );
    }

    if (err.response?.status === 429) {
      throw new ChatError(
        429,
        "The AI is busy right now. Please try again in a moment."
      );
    }

    throw new ChatError(
      502,
      "The AI service is unavailable. Please try again."
    );
  }

  const data =
    response.data;

  const text =
    (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

  if (!text) {

    console.log(
      "CHAT EMPTY RESPONSE:",
      JSON.stringify({
        promptFeedback: data?.promptFeedback,
        finishReason:
          data?.candidates?.[0]?.finishReason
      })
    );

    throw new ChatError(
      422,
      data?.promptFeedback?.blockReason
        ? "That message could not be answered. Try rephrasing it."
        : "The AI returned an empty reply. Please try again."
    );
  }

  return text;
}


function sendError(res, err, label) {

  if (err instanceof ChatError) {

    return res.status(err.status).json({
      error: err.message
    });
  }

  console.log(label, err);

  return res.status(500).json({
    error: "Something went wrong."
  });
}


// =====================================
// LIST MY SESSIONS (no messages)
// =====================================

router.get(
  "/sessions",
  authMiddleware,
  async (req, res) => {

    try {

      const sessions =
        await ChatSession
          .find({ userId: req.user.id })
          .select("title updatedAt createdAt")
          .sort({ updatedAt: -1 })
          .limit(MAX_SESSIONS_LISTED)
          .lean();

      res.json({ sessions });

    } catch (err) {

      sendError(
        res,
        err,
        "CHAT LIST ERROR:"
      );
    }
  }
);


// =====================================
// OPEN ONE SESSION (with messages)
// =====================================

router.get(
  "/sessions/:id",
  authMiddleware,
  async (req, res) => {

    try {

      if (
        !mongoose.isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(404).json({
          error: "Chat not found."
        });
      }

      const session =
        await ChatSession
          .findOne({
            _id: req.params.id,
            userId: req.user.id
          })
          .lean();

      if (!session) {
        return res.status(404).json({
          error: "Chat not found."
        });
      }

      res.json({ session });

    } catch (err) {

      sendError(
        res,
        err,
        "CHAT OPEN ERROR:"
      );
    }
  }
);


// =====================================
// SEND A MESSAGE
// Creates the session on first message.
// =====================================

router.post(
  "/message",
  authMiddleware,
  async (req, res) => {

    try {

      const { sessionId } =
        req.body || {};

      const message =
        typeof req.body?.message === "string"
          ? req.body.message.trim()
          : "";

      if (!message) {
        return res.status(400).json({
          error: "Message cannot be empty."
        });
      }

      if (message.length > MAX_MESSAGE_CHARS) {
        return res.status(400).json({
          error:
            `Message is too long (max ${MAX_MESSAGE_CHARS} characters).`
        });
      }

      let existing = null;

      if (sessionId) {

        if (
          !mongoose.isValidObjectId(sessionId)
        ) {
          return res.status(404).json({
            error: "Chat not found."
          });
        }

        existing =
          await ChatSession
            .findOne({
              _id: sessionId,
              userId: req.user.id
            })
            .lean();

        if (!existing) {
          return res.status(404).json({
            error: "Chat not found."
          });
        }

        if (
          existing.messages.length >=
          MAX_SESSION_MESSAGES
        ) {
          return res.status(400).json({
            error:
              "This chat is full. Please start a new chat."
          });
        }
      }

      const contents =
        buildContext(
          existing ? existing.messages : [],
          message
        );

      // If this throws, nothing is saved.
      const reply =
        await askGemini(contents);

      const now = new Date();

      const newMessages = [
        {
          role: "user",
          content: message,
          createdAt: now
        },
        {
          role: "assistant",
          content: reply,
          createdAt: new Date()
        }
      ];

      let session;

      if (existing) {

        session =
          await ChatSession.findOneAndUpdate(
            {
              _id: existing._id,
              userId: req.user.id
            },
            {
              $push: {
                messages: {
                  $each: newMessages
                }
              }
            },
            { new: true }
          );

        if (!session) {
          return res.status(404).json({
            error: "Chat not found."
          });
        }

      } else {

        session =
          await ChatSession.create({
            userId: req.user.id,
            title: makeTitle(message),
            messages: newMessages
          });
      }

      res.json({
        session: {
          _id: session._id,
          title: session.title,
          updatedAt: session.updatedAt
        },
        messages: newMessages
      });

    } catch (err) {

      sendError(
        res,
        err,
        "CHAT MESSAGE ERROR:"
      );
    }
  }
);


module.exports = router;
