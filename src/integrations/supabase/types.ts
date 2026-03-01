export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          type: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          type: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_name: string
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          recurrence_pattern: string | null
          recurring: boolean
          reminder_sent: boolean
          scheduled_date: string | null
          service_type: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_name?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean
          reminder_sent?: boolean
          scheduled_date?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          recurrence_pattern?: string | null
          recurring?: boolean
          reminder_sent?: boolean
          scheduled_date?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_drafts: {
        Row: {
          created_at: string
          draft_content: string | null
          draft_type: string | null
          id: string
          next_step: string | null
          request_id: string | null
          status: string
          subject: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          draft_content?: string | null
          draft_type?: string | null
          id?: string
          next_step?: string | null
          request_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          draft_content?: string | null
          draft_type?: string | null
          id?: string
          next_step?: string | null
          request_id?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_drafts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "assistant_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_profiles: {
        Row: {
          approval_required: boolean
          business_overview: string | null
          communication_preferences: string | null
          created_at: string
          id: string
          important_notes: string | null
          main_responsibilities: string | null
          preferred_tone: string | null
          priority_rules: string | null
          recurring_tasks: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          approval_required?: boolean
          business_overview?: string | null
          communication_preferences?: string | null
          created_at?: string
          id?: string
          important_notes?: string | null
          main_responsibilities?: string | null
          preferred_tone?: string | null
          priority_rules?: string | null
          recurring_tasks?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          approval_required?: boolean
          business_overview?: string | null
          communication_preferences?: string | null
          created_at?: string
          id?: string
          important_notes?: string | null
          main_responsibilities?: string | null
          preferred_tone?: string | null
          priority_rules?: string | null
          recurring_tasks?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_requests: {
        Row: {
          created_at: string
          id: string
          recommended_action: string | null
          request_details: string | null
          request_summary: string | null
          requester_name: string | null
          source: string | null
          status: string
          updated_at: string
          urgency: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommended_action?: string | null
          request_details?: string | null
          request_summary?: string | null
          requester_name?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recommended_action?: string | null
          request_details?: string | null
          request_summary?: string | null
          requester_name?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_tasks: {
        Row: {
          assigned_type: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_type?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_type?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          client_name: string
          created_at: string
          id: string
          notes: string | null
          preferred_time_slot: string | null
          requested_date: string | null
          requested_service: string | null
          source: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          preferred_time_slot?: string | null
          requested_date?: string | null
          requested_service?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          preferred_time_slot?: string | null
          requested_date?: string | null
          requested_service?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          workspace_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
          workspace_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "brain_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brain_chat_messages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_interactions: {
        Row: {
          action_taken: string
          created_at: string
          edited_content: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          original_content: string | null
          role_scope: string
          workspace_id: string
        }
        Insert: {
          action_taken: string
          created_at?: string
          edited_content?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          original_content?: string | null
          role_scope: string
          workspace_id: string
        }
        Update: {
          action_taken?: string
          created_at?: string
          edited_content?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          original_content?: string | null
          role_scope?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_interactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_memories: {
        Row: {
          category: string
          confidence: number
          created_at: string
          id: string
          last_used_at: string | null
          memory_key: string
          memory_value: string
          scope: string
          source: string
          times_reinforced: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          category?: string
          confidence?: number
          created_at?: string
          id?: string
          last_used_at?: string | null
          memory_key: string
          memory_value: string
          scope?: string
          source?: string
          times_reinforced?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          category?: string
          confidence?: number
          created_at?: string
          id?: string
          last_used_at?: string | null
          memory_key?: string
          memory_value?: string
          scope?: string
          source?: string
          times_reinforced?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_memories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_patterns: {
        Row: {
          confidence: number
          created_at: string
          description: string
          evidence: Json | null
          evidence_count: number
          id: string
          is_active: boolean
          pattern_type: string
          role_scope: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          description: string
          evidence?: Json | null
          evidence_count?: number
          id?: string
          is_active?: boolean
          pattern_type: string
          role_scope?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          description?: string
          evidence?: Json | null
          evidence_count?: number
          id?: string
          is_active?: boolean
          pattern_type?: string
          role_scope?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_patterns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brain_settings: {
        Row: {
          created_at: string
          id: string
          learn_from_approvals: boolean
          learn_from_edits: boolean
          learn_timing_suggestions: boolean
          learning_paused: boolean
          require_approval: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learn_from_approvals?: boolean
          learn_from_edits?: boolean
          learn_timing_suggestions?: boolean
          learning_paused?: boolean
          require_approval?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learn_from_approvals?: boolean
          learn_from_edits?: boolean
          learn_timing_suggestions?: boolean
          learning_paused?: boolean
          require_approval?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brain_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          approval_required: boolean
          brand_voice: string | null
          business_summary: string | null
          content_goals: string | null
          content_themes: string[] | null
          created_at: string
          hashtags: string[] | null
          id: string
          offer_type: string | null
          posting_frequency: string | null
          preferred_platforms: string[] | null
          target_audience: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          approval_required?: boolean
          brand_voice?: string | null
          business_summary?: string | null
          content_goals?: string | null
          content_themes?: string[] | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          offer_type?: string | null
          posting_frequency?: string | null
          preferred_platforms?: string[] | null
          target_audience?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          approval_required?: boolean
          brand_voice?: string | null
          business_summary?: string | null
          content_goals?: string | null
          content_themes?: string[] | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          offer_type?: string | null
          posting_frequency?: string | null
          preferred_platforms?: string[] | null
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_audience_lists: {
        Row: {
          audience_type: string | null
          created_at: string
          estimated_size: number | null
          id: string
          list_name: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          audience_type?: string | null
          created_at?: string
          estimated_size?: number | null
          id?: string
          list_name?: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          audience_type?: string | null
          created_at?: string
          estimated_size?: number | null
          id?: string
          list_name?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_audience_lists_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_brand_profiles: {
        Row: {
          approval_required: boolean
          audience_description: string | null
          brand_voice: string | null
          business_overview: string | null
          campaign_goals: string | null
          created_at: string
          frequency_preference: string | null
          id: string
          keywords: string | null
          offer_summary: string | null
          preferred_email_style: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          approval_required?: boolean
          audience_description?: string | null
          brand_voice?: string | null
          business_overview?: string | null
          campaign_goals?: string | null
          created_at?: string
          frequency_preference?: string | null
          id?: string
          keywords?: string | null
          offer_summary?: string | null
          preferred_email_style?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          approval_required?: boolean
          audience_description?: string | null
          brand_voice?: string | null
          business_overview?: string | null
          campaign_goals?: string | null
          created_at?: string
          frequency_preference?: string | null
          id?: string
          keywords?: string | null
          offer_summary?: string | null
          preferred_email_style?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_brand_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          id: string
          name: string
          objective: string | null
          status: string
          target_audience: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          campaign_type?: string
          created_at?: string
          id?: string
          name?: string
          objective?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          id?: string
          name?: string
          objective?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drafts: {
        Row: {
          body_copy: string | null
          call_to_action: string | null
          campaign_id: string | null
          created_at: string
          email_type: string | null
          id: string
          preview_text: string | null
          scheduled_date: string | null
          status: string
          subject_line: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          body_copy?: string | null
          call_to_action?: string | null
          campaign_id?: string | null
          created_at?: string
          email_type?: string | null
          id?: string
          preview_text?: string | null
          scheduled_date?: string | null
          status?: string
          subject_line?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          body_copy?: string | null
          call_to_action?: string | null
          campaign_id?: string | null
          created_at?: string
          email_type?: string | null
          id?: string
          preview_text?: string | null
          scheduled_date?: string | null
          status?: string
          subject_line?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_drafts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_connections: {
        Row: {
          account_name: string | null
          connected: boolean
          connected_at: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          platform: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_name?: string | null
          connected?: boolean
          connected_at?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          platform: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_name?: string | null
          connected?: boolean
          connected_at?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          platform?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_package: string
          active_workspace_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          purchase_date: string | null
          renewal_date: string | null
          subscription_status: string
          unlocked_roles: string[]
          updated_at: string
        }
        Insert: {
          active_package?: string
          active_workspace_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          purchase_date?: string | null
          renewal_date?: string | null
          subscription_status?: string
          unlocked_roles?: string[]
          updated_at?: string
        }
        Update: {
          active_package?: string
          active_workspace_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          purchase_date?: string | null
          renewal_date?: string | null
          subscription_status?: string
          unlocked_roles?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          billing_delay_days: number | null
          code: string
          created_at: string
          description: string | null
          discount_duration_months: number | null
          discount_type: string
          discount_value: number
          end_date: string | null
          expires_at: string | null
          first_billing_cycle_only: boolean | null
          growth_discount: number | null
          id: string
          is_active: boolean
          is_private: boolean | null
          is_visible_on_homepage: boolean | null
          is_visible_on_pricing: boolean | null
          label: string | null
          max_uses: number | null
          new_customers_only: boolean | null
          recurring_discount: boolean | null
          remove_trial: boolean | null
          start_date: string | null
          starter_discount: number | null
          team_discount: number | null
          trial_days: number | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          billing_delay_days?: number | null
          code: string
          created_at?: string
          description?: string | null
          discount_duration_months?: number | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          expires_at?: string | null
          first_billing_cycle_only?: boolean | null
          growth_discount?: number | null
          id?: string
          is_active?: boolean
          is_private?: boolean | null
          is_visible_on_homepage?: boolean | null
          is_visible_on_pricing?: boolean | null
          label?: string | null
          max_uses?: number | null
          new_customers_only?: boolean | null
          recurring_discount?: boolean | null
          remove_trial?: boolean | null
          start_date?: string | null
          starter_discount?: number | null
          team_discount?: number | null
          trial_days?: number | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          billing_delay_days?: number | null
          code?: string
          created_at?: string
          description?: string | null
          discount_duration_months?: number | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          expires_at?: string | null
          first_billing_cycle_only?: boolean | null
          growth_discount?: number | null
          id?: string
          is_active?: boolean
          is_private?: boolean | null
          is_visible_on_homepage?: boolean | null
          is_visible_on_pricing?: boolean | null
          label?: string | null
          max_uses?: number | null
          new_customers_only?: boolean | null
          recurring_discount?: boolean | null
          remove_trial?: boolean | null
          start_date?: string | null
          starter_discount?: number | null
          team_discount?: number | null
          trial_days?: number | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      public_support_tickets: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      scheduling_insights: {
        Row: {
          client_name: string | null
          confidence: number
          created_at: string
          description: string
          id: string
          insight_type: string
          is_active: boolean
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_name?: string | null
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          is_active?: boolean
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_name?: string | null
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          is_active?: boolean
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_insights_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      slack_workspace_settings: {
        Row: {
          access_alerts_enabled: boolean
          billing_alerts_enabled: boolean
          content_approvals_enabled: boolean
          created_at: string
          daily_summary_enabled: boolean
          default_channel_id: string | null
          default_channel_name: string | null
          id: string
          installed_by_user_id: string | null
          last_test_sent_at: string | null
          marketing_updates_enabled: boolean
          notifications_enabled: boolean
          platform_connection_id: string | null
          scheduling_alerts_enabled: boolean
          slack_bot_user_id: string | null
          slack_team_id: string | null
          slack_team_name: string | null
          slack_workspace_name: string | null
          support_alerts_enabled: boolean
          updated_at: string
          weekly_summary_enabled: boolean
          workspace_id: string
        }
        Insert: {
          access_alerts_enabled?: boolean
          billing_alerts_enabled?: boolean
          content_approvals_enabled?: boolean
          created_at?: string
          daily_summary_enabled?: boolean
          default_channel_id?: string | null
          default_channel_name?: string | null
          id?: string
          installed_by_user_id?: string | null
          last_test_sent_at?: string | null
          marketing_updates_enabled?: boolean
          notifications_enabled?: boolean
          platform_connection_id?: string | null
          scheduling_alerts_enabled?: boolean
          slack_bot_user_id?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_workspace_name?: string | null
          support_alerts_enabled?: boolean
          updated_at?: string
          weekly_summary_enabled?: boolean
          workspace_id: string
        }
        Update: {
          access_alerts_enabled?: boolean
          billing_alerts_enabled?: boolean
          content_approvals_enabled?: boolean
          created_at?: string
          daily_summary_enabled?: boolean
          default_channel_id?: string | null
          default_channel_name?: string | null
          id?: string
          installed_by_user_id?: string | null
          last_test_sent_at?: string | null
          marketing_updates_enabled?: boolean
          notifications_enabled?: boolean
          platform_connection_id?: string | null
          scheduling_alerts_enabled?: boolean
          slack_bot_user_id?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_workspace_name?: string | null
          support_alerts_enabled?: boolean
          updated_at?: string
          weekly_summary_enabled?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slack_workspace_settings_platform_connection_id_fkey"
            columns: ["platform_connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slack_workspace_settings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      social_drafts: {
        Row: {
          caption: string | null
          created_at: string
          cta: string | null
          format: string | null
          hook: string | null
          id: string
          idea_title: string
          platform: string
          scheduled_date: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          cta?: string | null
          format?: string | null
          hook?: string | null
          id?: string
          idea_title?: string
          platform?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          cta?: string | null
          format?: string | null
          hook?: string | null
          id?: string
          idea_title?: string
          platform?: string
          scheduled_date?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_drafts: {
        Row: {
          confidence_level: string | null
          created_at: string
          escalation_flag: boolean
          id: string
          issue_summary: string | null
          referenced_policy: string | null
          status: string
          suggested_reply: string | null
          ticket_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string
          escalation_flag?: boolean
          id?: string
          issue_summary?: string | null
          referenced_policy?: string | null
          status?: string
          suggested_reply?: string | null
          ticket_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          confidence_level?: string | null
          created_at?: string
          escalation_flag?: boolean
          id?: string
          issue_summary?: string | null
          referenced_policy?: string | null
          status?: string
          suggested_reply?: string | null
          ticket_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_drafts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_knowledge_bases: {
        Row: {
          brand_tone: string | null
          business_overview: string | null
          created_at: string
          custom_policies: string | null
          escalation_rules: string | null
          example_responses: string | null
          id: string
          products_services: string | null
          refund_policy: string | null
          shipping_policy: string | null
          sop_notes: string | null
          support_hours: string | null
          support_principles: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          brand_tone?: string | null
          business_overview?: string | null
          created_at?: string
          custom_policies?: string | null
          escalation_rules?: string | null
          example_responses?: string | null
          id?: string
          products_services?: string | null
          refund_policy?: string | null
          shipping_policy?: string | null
          sop_notes?: string | null
          support_hours?: string | null
          support_principles?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          brand_tone?: string | null
          business_overview?: string | null
          created_at?: string
          custom_policies?: string | null
          escalation_rules?: string | null
          example_responses?: string | null
          id?: string
          products_services?: string | null
          refund_policy?: string | null
          shipping_policy?: string | null
          sop_notes?: string | null
          support_hours?: string | null
          support_principles?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_knowledge_bases_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_knowledge_items: {
        Row: {
          content: string | null
          created_at: string
          id: string
          item_type: string
          title: string
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          item_type?: string
          title: string
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          item_type?: string
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_knowledge_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          channel: string
          created_at: string
          customer_message: string
          customer_name: string
          id: string
          issue_type: string | null
          sentiment: string | null
          status: string
          updated_at: string
          urgency: string
          workspace_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          customer_message?: string
          customer_name?: string
          id?: string
          issue_type?: string | null
          sentiment?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          customer_message?: string
          customer_name?: string
          id?: string
          issue_type?: string | null
          sentiment?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          audience: string | null
          brand_tone: string | null
          business_name: string
          created_at: string
          goals: string | null
          id: string
          industry: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          audience?: string | null
          brand_tone?: string | null
          business_name?: string
          created_at?: string
          goals?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          audience?: string | null
          brand_tone?: string | null
          business_name?: string
          created_at?: string
          goals?: string | null
          id?: string
          industry?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_owner: { Args: { _workspace_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
