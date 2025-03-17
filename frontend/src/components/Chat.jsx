import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:7001");
const Chat = ({ username, room }) => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit("join-room", { username, room });

    socket.on("received-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.emit("leave-room", room);
      socket.off("received-message");
    };
  }, [room, username]);
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", { room, message, sender: username });
      setMessage("");
    }
  };
  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="type a message..."
      />
      <button onClick={sendMessage}>send</button>
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}:</strong>
            {msg.message}
          </div>
        ))
      ) : (
        <h2>"no message to show"</h2>
      )}
    </div>
  );
};

export default Chat;
