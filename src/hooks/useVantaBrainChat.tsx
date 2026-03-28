import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vantabrain-chat`;

export function useVantaBrainChat() {
  const { workspace } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const isGuest = !workspace?.id;

  // Load conversations list (authenticated only)
  const loadConversations = useCallback(async () => {
    if (isGuest) {
      setLoadingConversations(false);
      return;
    }
    setLoadingConversations(true);
    const { data } = await supabase
      .from("brain_conversations")
      .select("*")
      .eq("workspace_id", workspace.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    setConversations((data as Conversation[]) || []);
    setLoadingConversations(false);
  }, [workspace?.id, isGuest]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("brain_chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data as ChatMessage[]) || []);
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (convId: string) => {
    setActiveConversationId(convId);
    await loadMessages(convId);
  }, [loadMessages]);

  // Start a new conversation (authenticated only)
  const startNewConversation = useCallback(async () => {
    if (isGuest) return null;
    const { data, error } = await supabase
      .from("brain_conversations")
      .insert({ workspace_id: workspace!.id, title: "New conversation" })
      .select()
      .single();
    if (error || !data) {
      toast.error("Failed to start conversation");
      return null;
    }
    const conv = data as Conversation;
    setConversations(prev => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages([]);
    return conv.id;
  }, [workspace?.id, isGuest]);

  // Send a message and stream response
  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    let convId = activeConversationId;

    // For authenticated users, create a conversation if needed
    if (!isGuest && !convId) {
      convId = await startNewConversation();
      if (!convId) return;
    }

    // Save user message locally
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Persist to DB for authenticated users
    if (!isGuest && convId) {
      await supabase.from("brain_chat_messages").insert({
        conversation_id: convId,
        workspace_id: workspace!.id,
        role: "user",
        content,
      });

      // Update conversation title from first message
      if (messages.length === 0) {
        const title = content.slice(0, 60) + (content.length > 60 ? "…" : "");
        await supabase.from("brain_conversations").update({ title }).eq("id", convId);
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c));
      }
    }

    // Prepare messages for API (include history)
    const allMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    // Stream response
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    // Add placeholder assistant message
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: allMessages,
          workspaceId: isGuest ? null : workspace!.id,
          conversationId: convId || null,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message to DB (authenticated only)
      if (!isGuest && assistantContent && convId) {
        await supabase.from("brain_chat_messages").insert({
          conversation_id: convId,
          workspace_id: workspace!.id,
          role: "assistant",
          content: assistantContent,
        });
        await supabase.from("brain_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error(e.message || "Failed to get response");
        if (!assistantContent) {
          setMessages(prev => prev.filter(m => m.id !== assistantId));
        }
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [workspace?.id, isGuest, activeConversationId, isStreaming, messages, startNewConversation]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearHistory = useCallback(async () => {
    if (isGuest) {
      setMessages([]);
      return;
    }
    await supabase.from("brain_conversations").delete().eq("workspace_id", workspace!.id);
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    toast.success("Conversation history cleared");
  }, [workspace?.id, isGuest]);

  return {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    loadingConversations,
    sendMessage,
    selectConversation,
    startNewConversation,
    stopStreaming,
    clearHistory,
  };
}
