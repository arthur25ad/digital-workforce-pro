import { useState, useRef, useEffect } from "react";
import { useVantaBrainChat } from "@/hooks/useVantaBrainChat";
import { Brain, Send, Plus, MessageSquare, Trash2, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const PURPLE = "hsl(280 70% 65%)";

const QUICK_PROMPTS = [
  "What has VANTABRAIN learned about my business?",
  "Which AI Employees do I have unlocked?",
  "What should I do next?",
  "What patterns have been detected so far?",
  "What is still not set up?",
];

export default function VantaBrainAssistant() {
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    sendMessage,
    selectConversation,
    startNewConversation,
    stopStreaming,
    clearHistory,
  } = useVantaBrainChat();

  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/40 bg-background" style={{
            boxShadow: `0 0 20px hsl(280 70% 65% / 0.15)`
          }}>
            <Brain size={16} style={{ color: PURPLE }} />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-foreground">Ask VANTABRAIN</h2>
            <p className="text-[10px] text-muted-foreground">Your workspace intelligence assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] text-muted-foreground"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock size={12} className="mr-1" />
            History
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] text-muted-foreground"
            onClick={() => startNewConversation()}
          >
            <Plus size={12} className="mr-1" />
            New
          </Button>
        </div>
      </div>

      <div className="flex" style={{ minHeight: 420 }}>
        {/* Conversation sidebar */}
        {showHistory && (
          <div className="w-52 border-r border-border/30 bg-background/50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/60 p-3 text-center">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={`w-full text-left rounded-lg px-3 py-2 text-[11px] transition-all ${
                      activeConversationId === conv.id
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                    onClick={() => {
                      selectConversation(conv.id);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={10} className="shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
            {conversations.length > 0 && (
              <div className="p-2 border-t border-border/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-[10px] text-muted-foreground hover:text-destructive"
                  onClick={clearHistory}
                >
                  <Trash2 size={10} className="mr-1" /> Clear All
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 360 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Brain size={32} className="mb-3 text-muted-foreground/20" />
                <p className="text-sm font-medium text-foreground/80">Ask me anything about your workspace</p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                  I know your business context, learned preferences, and AI Employee activity.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-md">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-lg border border-border/40 bg-background/60 px-3 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                      onClick={() => sendMessage(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-foreground/10 text-foreground rounded-br-md"
                          : "border border-border/30 bg-background/60 text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_strong]:text-foreground [&_code]:text-xs [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/30 p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VANTABRAIN anything…"
                rows={1}
                className="flex-1 resize-none rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/60 transition-colors"
                style={{ minHeight: 40, maxHeight: 100 }}
              />
              {isStreaming ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl border border-border/40"
                  onClick={stopStreaming}
                >
                  <Square size={14} className="text-muted-foreground" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl border border-border/40"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={input.trim() ? { borderColor: PURPLE, color: PURPLE } : {}}
                >
                  <Send size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
