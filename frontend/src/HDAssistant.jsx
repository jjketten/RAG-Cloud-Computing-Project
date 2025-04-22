import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { FaUser, FaArrowLeft, FaHeadset, FaCommentDots, FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';
import aiHelpDeskService from './aiHelpDeskService';

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

const HDAssistant = () => {
  const [sidebarCollapsed, setSidebarCollaspsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const userMenuRef = useRef(null);

  //Add the Ref + Scroll Logic
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    const typingMsg = { sender: 'bot', text: '...' };
    setChat((prevChat) => [...prevChat, userMsg, typingMsg]);
    setInput('');

    const responseText = await getBotResponse(input);
    const botMsg = { sender: 'bot', text: responseText };
    setChat((prevChat) => {
      const updatedChat = [...prevChat];
      updatedChat[updatedChat.indexOf(typingMsg)] = botMsg;
      return updatedChat;
    });
  };

  const getBotResponse = async (message) => {
    const lower = message.toLowerCase();
    for (const key in faqs) {
      if (lower.includes(key)) return faqs[key];
    }

    try {
      const result = await aiHelpDeskService.getHelpDeskResponse(message);
      console.log(result)
      return result;
    } catch (error) {
      console.error('Error fetching response:', error.message);
      return "Sorry, I couldn't fetch a response at the moment. Please try again later."
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleLogout = () => {
    alert("Logging out... ");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatText = (text) => {
    return text.replace(/\n/g, "<br/>");
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="user-icon-wrapper">
          <div className="sidebar-header">
            <FaUser className="icon" onClick={() => setShowUserMenu(!showUserMenu)} />
            <FaArrowLeft className="icon" onClick={() => setSidebarCollaspsed(!sidebarCollapsed)} />
          </div>
          {showUserMenu && (
            <div className="user-dropdown" ref={userMenuRef}>
              <p>👤 View Profile</p>
              <p>⚙️ Settings</p>
              <p onClick={handleLogout}><FaSignOutAlt /> Logout</p>
            </div>
          )}
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
        <div className="main-header">
          <h1 className="main-title">IT Helpdesk Assistant</h1>
        </div>
        <FaHeadset className="headset-icon" />

        <div className="chatbox">
          <div className="chat-log">
            {chat.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
                dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
              />
            ))}
            <div ref={chatEndRef} />
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

export default HDAssistant;
