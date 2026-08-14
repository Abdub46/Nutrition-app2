import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';

// Slides in from the left, ChatGPT-style - lists saved conversations from
// localStorage (see utils/chatHistoryStorage.js). Presentational only; the
// parent (pages/Chatbot.jsx) owns the open/close state and the
// outside-click-to-close behavior, matching the existing homepage hamburger
// menu (components/home/HomeNavbar.jsx) - any click anywhere closes it.
const ChatHistorySidebar = ({ open, history, activeId, onNewChat, onSelect, onDelete, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="bg-white w-72 h-screen shadow-xl flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <div className="px-5 pt-6 pb-5 flex items-center justify-between border-b border-gray-100">
          <span
            className="text-xl font-black uppercase italic text-primary-900"
            style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}
          >
            HORIZON<span className="text-accent-500 not-italic">+</span> AI
          </span>
          <button onClick={onClose} aria-label="Close sidebar">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center gap-2 text-sm font-medium text-primary-700 border border-primary-200 hover:bg-primary-50 rounded-lg px-3 py-2.5 transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {history.length === 0 ? (
            <p className="text-xs text-gray-400 px-2">Your chat history will appear here.</p>
          ) : (
            history.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                  c.id === activeId ? 'bg-primary-50 text-primary-800' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSelect(c.id)}
              >
                <MessageSquare size={15} className="flex-shrink-0 text-gray-400" />
                <span className="flex-1 text-sm truncate">{c.title}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  aria-label="Delete conversation"
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistorySidebar;