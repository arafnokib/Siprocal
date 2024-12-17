import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const SiprocalChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Establish WebSocket connection
    const newSocket = new WebSocket('ws://localhost:8000/chat');

    newSocket.onopen = () => {
      setIsConnected(true);
      setMessages([{
        id: Date.now(),
        content: 'Connected to Siprocal Assistant. How can I help you today?',
        sender: 'assistant'
      }]);
    };

    newSocket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      setMessages(prevMessages => [
        ...prevMessages, 
        {
          id: Date.now(),
          content: response.content,
          sender: 'assistant'
        }
      ]);
    };

    newSocket.onclose = () => {
      setIsConnected(false);
    };

    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() === '' || !isConnected) return;

    // Add user message to chat
    setMessages(prevMessages => [
      ...prevMessages, 
      {
        id: Date.now(),
        content: inputMessage,
        sender: 'user'
      }
    ]);

    // Send message via WebSocket
    socket.send(JSON.stringify({ message: inputMessage }));

    // Clear input
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h1>Siprobot</h1>
      </div>
      <div className="chatbot-wrapper">
        <div className="chatbot-messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbot-input-area">
          <input 
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!isConnected}
          />
          <button 
            onClick={sendMessage} 
            disabled={!isConnected}
          >
            <Send size={20} />
          </button>
        </div>
        {!isConnected && (
          <div className="connection-status">
            <MessageCircle size={24} />
            Connecting to Siprocal Assistant...
          </div>
        )}
      </div>
    </div>
  );
};

// Comprehensive CSS for the chatbot
const chatbotStyles = 

`
body {
  background-color: #f0f2f5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.chatbot-container {
  width: 450px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.chatbot-header {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 15px 0;
  font-size: 18px;
  font-weight: 600;
}

.chatbot-wrapper {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chatbot-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #f9fafb;
}

.message {
  max-width: 80%;
  margin-bottom: 10px;
  padding: 10px 15px;
  border-radius: 18px;
  clear: both;
  word-wrap: break-word;
}

.user-message {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
  float: right;
  margin-left: auto;
}

.assistant-message {
  background-color: #e9ecef;
  color: #333;
  align-self: flex-start;
  float: left;
}

.chatbot-input-area {
  display: flex;
  padding: 10px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

.chatbot-input-area input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
  outline: none;
}

.chatbot-input-area button {
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chatbot-input-area button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.connection-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  color: #666;
}

.connection-status svg {
  margin-right: 10px;
}

@media (max-width: 480px) {
  .chatbot-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
`;

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = chatbotStyles;
document.head.appendChild(styleSheet);

export default SiprocalChatbot;