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
