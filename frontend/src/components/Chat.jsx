import React, { useEffect, useRef, useState, useCallback, use } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:7001", {
  withCredentials: true,
  transports: ["websocket"],
  upgrade: false,
});

const Chat = ({ username, room }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const socketIdRef = useRef(null);
  const hasCreatedOffer = useRef(false);
  const [remoteUsername, setRemoteUsername] = useState("");

  const setupWebRTC = async (localStream) => {
    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    };

    peerRef.current = new RTCPeerConnection(configuration);
    streamRef.current = localStream;

    localStream.getTracks().forEach((track) => {
      console.log("Adding track:", track);
      peerRef.current.addTrack(track, localStream);
    });

    peerRef.current.ontrack = (event) => {
      console.log("Received remote stream");
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("ice-candidate", event.candidate);
      }
    };
    peerRef.current.oniceconnectionstatechange = (event) => {
      console.log("ICE connection state change:", event);
    };
  };

  useEffect(() => {
    socketIdRef.current = socket.id;
    console.log("Socket ID:", socketIdRef.current);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideo.current.srcObject = stream;
        setupWebRTC(stream).then(() => {
          socket.emit("join-room", { room, username });
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    socket.on("user-connected", async ({ from, username }) => {
      console.log("User connected:", from, "my id", socket.id);
      setRemoteUsername(username);
      if (from === socket.id) return;

      setIsConnected(true);
      if (!hasCreatedOffer.current) {
        console.log("Creating offer... as first user is in the room");
        hasCreatedOffer.current = true;
        try {
          const offer = await peerRef.current.createOffer();
          await peerRef.current.setLocalDescription(offer);
          console.log("Sending offer:", offer);
          socket.emit("offer", offer);
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    });

    socket.on("offer", async (offer) => {
      console.log("received offer", offer);
      if (!peerRef.current) {
        console.error("Peer connection is not initialized");
        return;
      }
      try {
        setIsConnected(true);
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerRef.current.createAnswer();

        await peerRef.current.setLocalDescription(answer);
        console.log("Sending answer:", answer);
        socket.emit("answer", answer);
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    });
    socket.on("answer", async (answer) => {
      console.log("Received answer:", answer);
      if (!peerRef.current) {
        console.error("Peer connection is not initialized");
        return;
      }
      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Connection established");
      } catch (error) {
        console.log("Error establishing connection:", error);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (!peerRef.current) {
        console.error("Peer connection is not initialized");
        return;
      }

      try {
        console.log("Received ICE candidate:", candidate);
        await peerRef.current.addIceCandidate(candidate);
      } catch (error) {
        console.log("error adding ICE candidate:", error);
      }
    });

    socket.on("user-disconnected", () => {
      console.log("User disconnected");
      setIsConnected(false);
      if (userVideo.current) {
        userVideo.current.srcObject = null;
      }
      hasCreatedOffer.current = false;
    });
    socket.on("received-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      console.log("Cleaning up...");
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");
      socket.off("received-message");

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      socket.emit("leave-room", { username, room });
    };
  }, [room]);

  const sendMessage = useCallback(() => {
    if (message.trim()) {
      socket.emit("send-message", { room, message, sender: username });
      setMessage("");
    }
  }, [message, room, username]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-18px",
          left: "2px",
          color: "#888",
          zIndex: 1,
        }}
      >
        <h4>roomId: {room}</h4>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "10px" }}>
          {isConnected ? (
            <h2 style={{ color: "green" }}>{username}</h2>
          ) : (
            <h2 style={{ color: "red" }}>Not connected</h2>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <video
            ref={myVideo}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "45%",
              borderRadius: "10px",
              marginBottom: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          />
          {remoteUsername && (
            <h2 style={{ marginBottom: "10px", color: "red" }}>
              {remoteUsername}
            </h2>
          )}
          <video
            ref={userVideo}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "45%",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: "20%",
          padding: "20px",
          borderLeft: "2px solid #ccc",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginBottom: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "white",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Send
          </button>
        </div>
        <div style={{ overflowY: "auto", height: "calc(100% - 80px)" }}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ccc",
                  marginBottom: "10px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            ))
          ) : (
            <h2>No messages yet</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
