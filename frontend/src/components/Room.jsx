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
    <div>
      {!joined ? (
        <div>
          <h2> joined private chat</h2>
          <input
            type="text"
            placeholder="enter the name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="enter room id"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <Chat username={username} room={room} />
      )}
    </div>
  );
};

export default Room;
