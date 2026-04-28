import React, { useEffect, useState } from "react";
import socket from "../socket";

export default function Notifications() {
  // ✅ State stores structured objects (type, text, time)
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // ✅ Attach listeners when component mounts

    // Listen for "taskShared" event
    socket.on("taskShared", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "shared",
          text: `Task ${data.taskId} shared with you`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    // Listen for "taskUpdated" event
    socket.on("taskUpdated", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "updated",
          text: `Task ${data.taskId} updated to ${data.status}`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    // Listen for "error" event (frontend error handling)
    socket.on("errorNotification", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          text: data.message || "An error occurred while processing your request",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    });

    // ✅ Clean up listeners when component unmounts
    return () => {
      socket.off("taskShared");
      socket.off("taskUpdated");
      socket.off("errorNotification");
    };
  }, []);

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      <ul>
        {messages.map((msg, i) => (
          <li key={i} className={`notification-${msg.type}`}>
            <strong>{msg.time}</strong> – {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
