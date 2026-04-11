import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Send,
  Trash2,
  MessageSquare,
  Heart,
  Zap,
} from "lucide-react";
import ChatMessage from "../components/custom/ChatMessage";
import { useAuth } from "../context/AuthContext";
import "../styles/ChatPage.css";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface Report {
  _id: string;
  userId: string;
  fileName: string;
  analysis: {
    summary: string;
    findings: string[];
    concerns: string[];
    suggestions: string[];
  };
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [latestReport, setLatestReport] = useState<Report | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch latest report
        const reportRes = await axios.get(
          "http://localhost:5001/api/reports/latest",
          { headers }
        );

        if (reportRes.data.success) {
          setLatestReport(reportRes.data.report);
        }

        // Fetch chat history
        const historyRes = await axios.get(
          "http://localhost:5001/api/chat/history",
          { headers }
        );

        if (historyRes.data.success) {
          const formattedMessages: Message[] = historyRes.data.messages.map(
            (msg: { role: string; content: string }, index: number) => ({
              role: msg.role === "model" ? "model" : "user",
              content: msg.content,
              timestamp: new Date(Date.now() - (historyRes.data.messages.length - index) * 60000).toLocaleTimeString(
                "en-US",
                { hour: "2-digit", minute: "2-digit" }
              ),
            })
          );
          setMessages(formattedMessages);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Load error:", message);
      } finally {
        setPageLoading(false);
      }
    };

    loadInitialData();
  }, [token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const reportSummary = latestReport
        ? `Report: ${latestReport.fileName}\nSummary: ${latestReport.analysis.summary}`
        : "";

      const response = await axios.post(
        "http://localhost:5001/api/chat/send",
        {
          message: messageText,
          reportSummary,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const aiMessage: Message = {
          role: "model",
          content: response.data.message,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error("Chat response error:", response.data);
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send message";
      console.error("Send error:", errorMsg);
      alert("Error: " + errorMsg);
    } finally {
      setLoading(false);
    }
  }, [inputValue, token, latestReport]);

  // Handle clear conversation
  const handleClearConversation = async () => {
    if (window.confirm("Clear all messages? This cannot be undone.")) {
      try {
        await axios.post(
          "http://localhost:5001/api/chat/clear",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages([]);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to clear";
        console.error("Clear error:", message);
      }
    }
  };

  if (pageLoading) {
    return (
      <div className="chat-page">
        <div className="chat-loading">
          <div className="chat-loading-spinner" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="chat-back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} />
          </button>
          <h1>Health Assistant</h1>
        </div>
        {messages.length > 0 && (
          <button className="chat-clear-btn" onClick={handleClearConversation} title="Clear conversation">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <Heart size={48} />
            </div>
            <h2>Welcome to HealthLens AI Chat</h2>
            <p>
              Ask me anything about your medical report, health insights, or wellness
              questions.
            </p>

            {latestReport && (
              <div className="chat-context-card">
                <div className="context-icon">
                  <MessageSquare size={16} />
                </div>
                <div className="context-info">
                  <div className="context-label">Current Report</div>
                  <div className="context-value">{latestReport.fileName}</div>
                </div>
              </div>
            )}

            <div className="chat-suggestions">
              <div className="suggestions-title">
                <Zap size={14} /> Try asking:
              </div>
              <div className="suggestions-grid">
                <button
                  className="suggestion-btn"
                  onClick={() => {
                    setInputValue("What do my test results mean?");
                  }}
                >
                  📊 What do my results mean?
                </button>
                <button
                  className="suggestion-btn"
                  onClick={() => {
                    setInputValue("What should I do about my health concerns?");
                  }}
                >
                  💡 What should I do?
                </button>
                <button
                  className="suggestion-btn"
                  onClick={() => {
                    setInputValue("Can you explain this in simpler terms?");
                  }}
                >
                  🎯 Explain in simple terms
                </button>
                <button
                  className="suggestion-btn"
                  onClick={() => {
                    setInputValue("What wellness tips do you recommend?");
                  }}
                >
                  🌟 Wellness tips
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            {loading && (
              <div className="chat-message ai-loading">
                <div className="chat-message-container">
                  <div className="chat-message-avatar ai-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 6v2m0 8v2m-6-4h2m8 0h2" />
                    </svg>
                  </div>
                  <div className="chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything about your health..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
          />
          <button
            className="chat-send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="chat-disclaimer">
          💬 This AI assistant provides information only. Always consult your doctor for medical advice.
        </p>
      </div>
    </div>
  );
}

