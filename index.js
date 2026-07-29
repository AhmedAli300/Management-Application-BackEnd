const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});


app.set("io", io);

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/managementApplication";

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to database successfully");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes

const usersRoute = require("./routes/user");
const projectsRoute = require("./routes/projects");
const tasksRoute = require("./routes/tasks");


app.use("/user", usersRoute);
app.use("/projects", projectsRoute);
app.use("/tasks", tasksRoute);


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);


  socket.on("joinProject", (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined room: project:${projectId}`);
  });


  socket.on("leaveProject", (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`Socket ${socket.id} left room: project:${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error handler:", err.stack || err.message || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
