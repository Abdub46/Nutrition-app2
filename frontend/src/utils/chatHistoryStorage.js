const STORAGE_KEY = 'horizonAIChatHistory';
const MAX_CONVERSATIONS = 30; // caps localStorage growth - oldest conversations drop off first

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // localStorage unavailable/full (e.g. private browsing) - history just won't persist this session.
  }
};

// Most recently updated conversation first.
export const getChatHistory = () => readAll().sort((a, b) => b.updatedAt - a.updatedAt);

// Creates or updates a conversation entry and returns the refreshed, sorted list.
export const saveConversation = ({ id, title, messages }) => {
  const conversations = readAll();
  const existingIndex = conversations.findIndex((c) => c.id === id);
  const entry = { id, title, messages, updatedAt: Date.now() };

  if (existingIndex >= 0) {
    conversations[existingIndex] = entry;
  } else {
    conversations.unshift(entry);
  }

  const trimmed = conversations.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_CONVERSATIONS);
  writeAll(trimmed);
  return trimmed;
};

// Removes one conversation and returns the refreshed list.
export const deleteConversation = (id) => {
  const remaining = readAll().filter((c) => c.id !== id);
  writeAll(remaining);
  return remaining;
};

export const newConversationId = () => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;