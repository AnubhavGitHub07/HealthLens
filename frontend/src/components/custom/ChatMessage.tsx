import { User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`chat-message ${isUser ? "user" : "ai"}`}>
      <div className="chat-message-container">
        {!isUser && (
          <div className="chat-message-avatar ai-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 6v2m0 8v2m-6-4h2m8 0h2" />
            </svg>
          </div>
        )}

        <div className="chat-message-content">
          <div className={`chat-bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
            {content}
          </div>
          {timestamp && <span className="chat-timestamp">{timestamp}</span>}
        </div>

        {isUser && (
          <div className="chat-message-avatar user-avatar">
            <User size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
