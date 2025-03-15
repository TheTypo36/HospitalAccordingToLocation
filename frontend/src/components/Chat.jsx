import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:7001");
const Chat = () => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("received-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off();
  }, []);
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", message);
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
        messages.map((msg, index) => <div key={index}>{msg}</div>)
      ) : (
        <h2>"no message to show"</h2>
      )}
    </div>
  );
};

export default Chat;
