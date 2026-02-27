
-- Conversations table
CREATE TABLE public.brain_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain conversations"
  ON public.brain_conversations FOR SELECT
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own brain conversations"
  ON public.brain_conversations FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can update own brain conversations"
  ON public.brain_conversations FOR UPDATE
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own brain conversations"
  ON public.brain_conversations FOR DELETE
  USING (is_workspace_owner(workspace_id));

CREATE TRIGGER update_brain_conversations_updated_at
  BEFORE UPDATE ON public.brain_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages table
CREATE TABLE public.brain_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.brain_conversations(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain chat messages"
  ON public.brain_chat_messages FOR SELECT
  USING (is_workspace_owner(workspace_id));

CREATE POLICY "Users can create own brain chat messages"
  ON public.brain_chat_messages FOR INSERT
  WITH CHECK (is_workspace_owner(workspace_id));

CREATE POLICY "Users can delete own brain chat messages"
  ON public.brain_chat_messages FOR DELETE
  USING (is_workspace_owner(workspace_id));

CREATE INDEX idx_brain_chat_messages_conversation ON public.brain_chat_messages(conversation_id, created_at);
CREATE INDEX idx_brain_conversations_workspace ON public.brain_conversations(workspace_id, updated_at DESC);
