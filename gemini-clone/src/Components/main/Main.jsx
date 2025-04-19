import React, { useState, useRef, useEffect } from 'react';
import './main.css';
import { FiMic, FiImage, FiSend } from 'react-icons/fi';
import sendToGemini from '../../config/Gemini';

// Firebase Auth Setup
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyABp8wB96PWLkLEgALiDPe0x9XIv7H1Ah4",
  authDomain: "your-app.firebaseapp.com",
  projectId: "gemini-a213a",
  storageBucket: "gemini-a213a.firebasestorage.app",
  messagingSenderId: "516758998377",
  appId: "1:516758998377:web:211a18ec15becbd301c1f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Suggestions
const suggestions = [
  "Suggest beautiful places to see on an upcoming road trip",
  "Briefly summarize this concept: urban planning",
  "Brainstorm team bonding activities for our work retreat",
  "Tell me about React js and React native"
];

const Main = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser({
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL
      });
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("❌ Logout error:", error.message);
    }
  };

  const getFirstName = (fullName) => fullName?.split(" ")[0];

  const handleSend = async (text = input) => {
    if (text.trim()) {
      const userMessage = { text, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      try {
        let botMessage = { text: "", sender: "bot" };
        setMessages((prev) => [...prev, botMessage]);

        const botStream = await sendToGemini(text);

        let responseText = "";
        let receivedAtLeastOneChunk = false;

        for await (const chunk of botStream) {
          if (chunk?.text) {
            receivedAtLeastOneChunk = true;
            responseText += chunk.text;

            botMessage = { text: responseText, sender: "bot" };

            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1] = { ...botMessage };
              return updatedMessages;
            });

            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        if (!receivedAtLeastOneChunk) {
          const fallbackMessage = { text: "Hmm, I didn't receive anything. Try again?", sender: "bot" };
          setMessages((prev) => [...prev.slice(0, -1), fallbackMessage]);
        }

      } catch (error) {
        console.error("❌ API Error:", error);
        const errorMsg = { text: "Oops! Something went wrong.", sender: "bot" };
        setMessages((prev) => [...prev.slice(0, -1), errorMsg]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    handleSend(text);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollTop = inputRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="main">
      <div className="auth-btn-topright">
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={handleLogin}>Login with Google</button>
        )}
      </div>

      <header className="main-header">
        <h1>
          <span className="gradient-text">
            Hello{user ? `, ${getFirstName(user.name)}` : ", Guest"}.
          </span>
        </h1>
        <h2>How can I help you today?</h2>
      </header>

      <div className="cards">
        {suggestions.map((text, idx) => (
          <div className="card" key={idx} onClick={() => handleSuggestionClick(text)}>
            <p>{text}</p>
            <span className="icon">{['✏️', '💡', '💬', '💻'][idx]}</span>
          </div>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>

      <div className="input-container">
        <textarea
          ref={inputRef}
          placeholder="Enter a prompt here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
        />
        <div className="input-icons">
          <FiImage size={20} />
          <FiMic size={20} />
          {input.trim() && (
            <FiSend
              size={20}
              className="send-icon"
              onClick={() => handleSend()}
              title="Send"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
