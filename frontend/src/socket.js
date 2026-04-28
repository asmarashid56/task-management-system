// src/socket.js
import { io } from "socket.io-client";

// ✅ Connect to backend Socket.IO server
// Replace URL with your backend host (localhost:3000 or deployed URL)
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // force WebSocket for reliability
  reconnection: true,        // auto-reconnect if connection drops
  reconnectionAttempts: 5,   // try 5 times before giving up
  reconnectionDelay: 1000,   // wait 1s between attempts
});

// ✅ Export the socket instance for use in components
export default socket;
