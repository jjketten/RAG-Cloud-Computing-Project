import React, { useState } from 'react';
import './App.css';
import { FaUser, FaArrowLeft, FaHeadset, FaCommentDots, FaPaperPlane } from 'react-icons/fa';

const suggestions = [
  "I forgot my password",
  "My computer is moving slow",
  "I cannot connect my computer to my printer",
  "I need help installing my antivirus software"
];

const faqs = {
  "password": "You can reset your password at reset.company.com or contact IT support.",
  "slow": "Try restarting your computer and closing unused applications.",
  "printer": "Make sure your printer is powered on and connected to the same network.",
  "antivirus": "Please visit our software portal to install the company-approved antivirus."
};

const HelpdeskAssistant = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const responseText = getBotResponse(input);
    const botMsg = { sender: 'bot', text: responseText };

    setChat([...chat, userMsg, botMsg]);
    setInput('');
  };

  const getBotResponse = (message) => {
    const lower = message.toLowerCase();
    for (const key in faqs) {
      if (lower.includes(key)) return faqs[key];
    }
    return "I'm not sure about that, but you can contact our IT desk at support@company.com.";
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <FaUser className="icon" />
          <FaArrowLeft className="icon" />
          <h1 className="title">It Helpdesk Assistant</h1>
        </div>
        <div className="faq-section">
          <h2>FAQs</h2>
          <ul>
            <li>I can’t access my work email from home</li>
            <li>I am working from home and can’t access the company network</li>
            <li>My computer is running slow. What should I do?</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        <FaHeadset className="headset-icon" />

        <div className="chatbox">
          <div className="chat-log">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <FaCommentDots />
            <input
              type="text"
              placeholder="How can I help..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSend}><FaPaperPlane /></button>
          </div>

          <ul className="suggestions">
   {input &&
    suggestions
      .filter(s => s.toLowerCase().includes(input.toLowerCase()))
      .map((text, i) => (
        <li key={i} onClick={() => setInput(text)}>
          <FaCommentDots /> {text}
        </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpdeskAssistant;
