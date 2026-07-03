require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));

app.get("/", (req, res) => {
  res.send("CollabCode Backend is Running");
});

// Connect to Database and Start Server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Socket.io Setup
    const authenticateSocket = require("./sockets/authSocket");

    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    // Socket Authentication
    io.use(authenticateSocket);

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id, "| Email:", socket.user?.email);

      socket.on("join-room", async ({ projectId }) => {
        try {
          const Project = require("./models/Project");
          const project = await Project.findById(projectId);

          if (!project) {
            return socket.emit("error", { message: "Project not found" });
          }

          // Check access
          const isOwner = project.createdBy.toString() === socket.user.id;
          const isCollaborator = project.collaborators.some(
            (id) => id.toString() === socket.user.id,
          );

          if (!isOwner && !isCollaborator) {
            return socket.emit("error", {
              message: "Access denied to this project",
            });
          }

          socket.join(projectId);
          console.log(`User ${socket.user.email} joined room: ${projectId}`);

          // Notify others in room
          socket.to(projectId).emit("user-joined", {
            user: { id: socket.user.id, email: socket.user.email },
          });
        } catch (error) {
          console.error("Join room error:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      });

      socket.on("code-change", ({ projectId, code }) => {
        socket.to(projectId).emit("receive-change", { code });
      });

      socket.on("send-message", async (messageData) => {
        try {
          const Message = require("./models/Message");

          const savedMessage = await Message.create({
            roomId: messageData.roomId,
            senderId: socket.user.id,
            message: messageData.message,
          });

          const populatedMessage = await Message.findById(
            savedMessage._id,
          ).populate("senderId", "name email");

          const finalMessage = {
            ...populatedMessage.toObject(),
            senderName:
              populatedMessage.senderId.name || populatedMessage.senderId.email,
          };

          // Send to everyone in the room (including sender)
          io.to(messageData.roomId).emit("receive-message", finalMessage);
        } catch (error) {
          console.error("Message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    console.log("Socket.io initialized");
  })
  .catch((err) => {
    console.error("Failed to start server due to DB error:", err);
  });
