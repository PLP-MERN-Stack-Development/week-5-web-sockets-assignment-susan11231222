
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_typing", (data) => {
      setTypingUser(data.username);
    });

    socket.on("stop_typing", () => {
      setTypingUser("");
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });
  }, []);

  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setIsJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        sender: username,
        message,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit("send_message", msgData);
      setMessage("");
      socket.emit("stop_typing");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("user_typing", { username });
  };

  return (
    <div>
      {!isJoined ? (
        <div>
          <h2>Enter Username</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div>
          <h3>Welcome, {username} ❤️🥰</h3>
          <p>🟢 Online: {onlineUsers.join(", ")}</p>

          <div style={{ height: "200px", overflowY: "scroll", border: "1px solid #ccc" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.sender}</strong> [{msg.timestamp}]: {msg.message}
              </div>
            ))}
          </div>

          <p>{typingUser && typingUser !== username ? `${typingUser} is typing...` : ""}</p>

          <input
            type="text"
            placeholder="Type message"
            value={message}
            onChange={handleTyping}
            onBlur={() => socket.emit("stop_typing")}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
