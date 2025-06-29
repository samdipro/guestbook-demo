// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/index.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Guestbook API is running!" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// GET all messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: messages.length,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
});

// GET all messages using a literal query string
app.get("/pesan", async (req, res) => {
  try {
    const messages = await prisma.$queryRaw`
      SELECT * FROM "Message"
      ORDER BY "createdAt" DESC
    `;

    res.json({
      success: true,
      count: messages.length,
      messages: messages,
    });
  } catch (error) {
    console.error("Error fetching messages with raw query:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
});

// POST new message
app.post("/messages", async (req, res) => {
  try {
    const { name, message } = req.body;

    // Basic validation
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        error: "Name and message are required",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Name must be less than 100 characters",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Message must be less than 1000 characters",
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        name: name.trim(),
        message: message.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create message",
    });
  }
});

// POST new message using a literal query string
app.post("/pesan", async (req, res) => {
  try {
    const { name, message } = req.body;

    // Basic validation
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        error: "Name and message are required",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Name must be less than 100 characters",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Message must be less than 1000 characters",
      });
    }

    // Insert new message using raw SQL query
    const newMessage = await prisma.$queryRaw`
      INSERT INTO "Message" ("name", "message", "createdAt")
      VALUES (${name.trim()}, ${message.trim()}, NOW())
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: newMessage[0],
    });
  } catch (error) {
    console.error("Error creating message with raw query:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create message",
    });
  }
});

// 404 handler
app.use("/{*any}", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start server
console.log("Starting server...");
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
