import { useState, useRef, useEffect } from "react";
import { useVantaBrainChat } from "@/hooks/useVantaBrainChat";
import { Brain, Send, Plus, MessageSquare, Trash2, Square, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const PURPLE = "hsl(280 70% 65%)";

const QUICK_PROMPTS = [
  "What has VANTABRAIN learned about my business?",
  "Which AI Employees do I have unlocked?",
  "What should I do next?",
  "What patterns have been detected so far?",
  "What is still not set up?",
];

interface VantaBrainAssistantProps {
  initialQuestion?: string;
  variant?: "default" | "flagship" | "overlay";
}

export default function VantaBrainAssistant({ initialQuestion, variant = "default" }: VantaBrainAssistantProps) {
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
  const [initialSent, setInitialSent] = useState(false);

  useEffect(() => {
    if (initialQuestion && !initialSent && !isStreaming && messages.length === 0) {
      setInitialSent(true);
      sendMessage(initialQuestion);
    }
  }, [initialQuestion, initialSent, isStreaming, messages.length, sendMessage]);

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

  const isFlagship = variant === "flagship";
  const isOverlay = variant === "overlay";
  const chatHeight = isOverlay ? 340 : isFlagship ? 400 : 360;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isFlagship
          ? "border-border/50 bg-card relative"
          : "border-border/40 bg-card"
      }`}
      style={isFlagship ? {
        boxShadow: `0 0 60px hsl(280 70% 65% / 0.08), 0 0 120px hsl(280 70% 65% / 0.04), 0 8px 32px hsl(0 0% 0% / 0.3)`,
      } : undefined}
    >
      {/* Flagship top glow */}
      {isFlagship && (
        <div className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      )}

      {/* Header */}
      <div className={`flex items-center justify-between border-b border-border/30 ${
        isFlagship ? "px-6 py-5" : "px-5 py-4"
      }`}>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center rounded-xl border border-border/40 bg-background ${
              isFlagship ? "h-11 w-11" : "h-8 w-8"
            }`}
            style={{
              boxShadow: isFlagship
                ? `0 0 30px hsl(280 70% 65% / 0.25), 0 0 60px hsl(280 70% 65% / 0.1)`
                : `0 0 20px hsl(280 70% 65% / 0.15)`,
            }}
          >
            <Brain size={isFlagship ? 22 : 16} style={{ color: PURPLE }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-display font-bold text-foreground ${
                isFlagship ? "text-lg" : "text-sm"
              }`}>
                Ask <span style={{ color: PURPLE }}>VANTABRAIN</span>
              </h2>
              {isFlagship && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium" style={{ color: PURPLE }}>
                  <Sparkles size={10} />
                  AI
                </span>
              )}
            </div>
            <p className={`text-muted-foreground ${isFlagship ? "text-xs" : "text-[10px]"}`}>
              Your workspace intelligence assistant
            </p>
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

      <div className="flex" style={{ minHeight: chatHeight }}>
        {/* Conversation sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 208, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border/30 bg-background/50 flex flex-col overflow-hidden"
            >
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
                      onClick={() => selectConversation(conv.id)}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: chatHeight - 60 }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/30 bg-background/60 mb-4"
                  style={{ boxShadow: `0 0 40px hsl(280 70% 65% / 0.1)` }}
                >
                  <Brain size={28} className="text-muted-foreground/30" />
                </div>
                <p className={`font-medium text-foreground/80 ${isFlagship ? "text-base" : "text-sm"}`}>
                  Ask me anything about your workspace
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                  I know your business context, learned preferences, and AI Employee activity.
                </p>
                <div className={`mt-5 flex flex-wrap gap-2 justify-center ${isFlagship ? "max-w-lg" : "max-w-md"}`}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-xl border border-border/40 bg-background/60 px-3.5 py-2 text-[11px] text-muted-foreground hover:text-foreground hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-200"
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
          <div className={`border-t border-border/30 ${isFlagship ? "p-4" : "p-3"}`}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VANTABRAIN anything…"
                rows={1}
                className={`flex-1 resize-none rounded-xl border border-border/40 bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500/40 transition-colors ${
                  isFlagship ? "focus:shadow-[0_0_20px_hsl(280_70%_65%/0.1)]" : ""
                }`}
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
                  className="h-10 w-10 shrink-0 rounded-xl border border-border/40 transition-all duration-200"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={input.trim() ? { borderColor: PURPLE, color: PURPLE, boxShadow: `0 0 12px hsl(280 70% 65% / 0.2)` } : {}}
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
