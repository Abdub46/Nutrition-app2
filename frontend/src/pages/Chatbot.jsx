import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import ChatHistorySidebar from '../components/chatbot/ChatHistorySidebar';
import { getChatHistory, saveConversation, deleteConversation, newConversationId } from '../utils/chatHistoryStorage';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm your personal nutrition assistant. Ask me about healthy eating, your BMI, meal ideas, hydration, or lifestyle tips. I can't diagnose conditions or prescribe medication — for those, please book an appointment with a nutrition counsellor.",
};

// First user message, trimmed down to a short sidebar label - same idea as
// ChatGPT's auto-generated conversation titles.
const titleFromMessages = (messages) => {
  const firstUserMessage = messages.find((m) => m.role === 'user');
  if (!firstUserMessage) return 'New chat';
  const text = firstUserMessage.content.trim();
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  // Left-side history sidebar (ChatGPT-inspired, persisted to localStorage)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    setHistory(getChatHistory());
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  // Close the sidebar on a click anywhere - matches the existing homepage
  // hamburger menu's behavior (components/home/HomeNavbar.jsx), except for
  // the toggle button itself (so opening it doesn't immediately close it).
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const handleDocumentClick = (event) => {
      if (menuButtonRef.current?.contains(event.target)) return;
      setSidebarOpen(false);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [sidebarOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setSending(true);

    try {
      const historyForApi = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/chatbot/message', { message: text, history: historyForApi });
      const finalMessages = [...newMessages, { role: 'assistant', content: data.reply }];
      setMessages(finalMessages);

      // Persist this round-trip to the sidebar's history - first message in a
      // conversation gets it a fresh id (and its title), later ones just update it.
      const conversationId = activeConversationId || newConversationId();
      if (!activeConversationId) setActiveConversationId(conversationId);
      setHistory(saveConversation({ id: conversationId, title: titleFromMessages(finalMessages), messages: finalMessages }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chatbot is unavailable right now');
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble responding right now. Please try again shortly." }]);
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setActiveConversationId(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    const conversation = history.find((c) => c.id === id);
    if (conversation) {
      setMessages(conversation.messages);
      setActiveConversationId(id);
    }
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id) => {
    const remaining = deleteConversation(id);
    setHistory(remaining);
    if (id === activeConversationId) {
      setMessages([WELCOME_MESSAGE]);
      setActiveConversationId(null);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="flex items-center">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open chat history"
          className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <ChatHistorySidebar
        open={sidebarOpen}
        history={history}
        activeId={activeConversationId}
        onNewChat={handleNewChat}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="card flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-xl px-4 py-2 text-sm">Typing...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 sticky bottom-4 bg-gray-50/95 backdrop-blur-sm py-2 -mx-1 px-1">
        <input
          className="input-field flex-1"
          placeholder="Ask about nutrition, BMI, meals, hydration..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2">
          <Send size={16} /> Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;

