import React, { useState, useRef, useEffect } from 'react';
import './main.css';
import { FiMic, FiImage, FiSend } from 'react-icons/fi';
import sendToGemini from '../../config/Gemini';

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

  const handleLogin = () => setUser({ name: "Uday" });
  const handleLogout = () => setUser(null);
  const getFirstName = (fullName) => fullName?.split(" ")[0];

  const handleSend = async (text = input) => {
    if (text.trim()) {
      const userMessage = { text, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);  // Start the typing indicator
  
      try {
        let botMessage = { text: "", sender: "bot" };
        setMessages((prev) => [...prev, botMessage]); // Initial empty bot message
  
        // Send the user text to Gemini API (assuming this handles streaming)
        const botStream = await sendToGemini(text);  // This should return an async iterator
  
        let responseText = "";
        for await (const chunk of botStream) {
          if (chunk?.text) {  // Ensure chunk.text exists
            responseText += chunk.text; // Accumulate the streamed text
          }
  
          botMessage = { text: responseText, sender: "bot" };
  
          // Update the messages state with the new text (incrementally)
          setMessages((prevMessages) => {
            // We modify only the last message (bot's message)
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = botMessage;
            return updatedMessages;
          });
  
          // Add a small delay to simulate typing
          await new Promise(resolve => setTimeout(resolve, 100)); // You can tweak the speed here
        }
  
      } catch (error) {
        console.error("❌ API Error:", error);
        const errorMsg = { text: "Oops! Something went wrong.", sender: "bot" };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false); // Stop the typing indicator when response is complete
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
          <button onClick={handleLogin}>Login</button>
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
