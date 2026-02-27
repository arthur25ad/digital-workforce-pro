
-- =============================================
-- VANTABRAIN: Shared Intelligence Layer
-- =============================================

-- Core memory entries (shared + role-specific)
CREATE TABLE public.brain_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'shared',
  category text NOT NULL DEFAULT 'preference',
  memory_key text NOT NULL,
  memory_value text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0.5,
  source text NOT NULL DEFAULT 'system',
  times_reinforced integer NOT NULL DEFAULT 1,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Behavioral patterns detected over time
CREATE TABLE public.brain_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role_scope text NOT NULL DEFAULT 'shared',
  pattern_type text NOT NULL,
  description text NOT NULL,
  evidence jsonb DEFAULT '[]'::jsonb,
  evidence_count integer NOT NULL DEFAULT 1,
  confidence numeric NOT NULL DEFAULT 0.5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- AI interaction log for learning (tracks approvals, edits, rejections)
CREATE TABLE public.brain_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role_scope text NOT NULL,
  interaction_type text NOT NULL,
  action_taken text NOT NULL,
  original_content text,
  edited_content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brain_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for brain_memories
CREATE POLICY "Users can view own brain memories" ON public.brain_memories FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own brain memories" ON public.brain_memories FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own brain memories" ON public.brain_memories FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own brain memories" ON public.brain_memories FOR DELETE USING (is_workspace_owner(workspace_id));

-- RLS policies for brain_patterns
CREATE POLICY "Users can view own brain patterns" ON public.brain_patterns FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own brain patterns" ON public.brain_patterns FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));
CREATE POLICY "Users can update own brain patterns" ON public.brain_patterns FOR UPDATE USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can delete own brain patterns" ON public.brain_patterns FOR DELETE USING (is_workspace_owner(workspace_id));

-- RLS policies for brain_interactions
CREATE POLICY "Users can view own brain interactions" ON public.brain_interactions FOR SELECT USING (is_workspace_owner(workspace_id));
CREATE POLICY "Users can create own brain interactions" ON public.brain_interactions FOR INSERT WITH CHECK (is_workspace_owner(workspace_id));

-- Indexes for performance
CREATE INDEX idx_brain_memories_workspace_scope ON public.brain_memories(workspace_id, scope);
CREATE INDEX idx_brain_patterns_workspace_scope ON public.brain_patterns(workspace_id, role_scope);
CREATE INDEX idx_brain_interactions_workspace ON public.brain_interactions(workspace_id, role_scope, created_at DESC);

-- Updated_at triggers
CREATE TRIGGER update_brain_memories_updated_at BEFORE UPDATE ON public.brain_memories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brain_patterns_updated_at BEFORE UPDATE ON public.brain_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
