import { useState } from "react";
import Chat from "./Chat";

const Room = () => {
  const [username, setUsername] = useState("");

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (username.trim() && room.trim()) {
      setJoined(true);
      setUsername(username.trim());
      setRoom(room.trim());
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",

        backgroundColor: "#f0f2f5",
      }}
    >
      {!joined ? (
        <div
          style={{
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            textAlign: "center",
            width: "30%",
          }}
        >
          <h2>Join Private Chat</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              display: "block",
              width: "80%",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="Enter room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              display: "block",
              width: "80%",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={joinRoom}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Join
          </button>
        </div>
      ) : (
        <Chat username={username} room={room} />
      )}
    </div>
  );
};

export default Room;
