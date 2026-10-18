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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bill_details: {
        Row: {
          amount_cents: number | null
          confirmed: boolean
          item_id: string
          paid_amount_cents: number | null
          paid_at: string | null
          period: string
          plan_id: string
          second_due_date: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          confirmed?: boolean
          item_id: string
          paid_amount_cents?: number | null
          paid_at?: string | null
          period: string
          plan_id: string
          second_due_date?: string | null
          user_id?: string
        }
        Update: {
          amount_cents?: number | null
          confirmed?: boolean
          item_id?: string
          paid_amount_cents?: number | null
          paid_at?: string | null
          period?: string
          plan_id?: string
          second_due_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_details_item_id_user_id_fkey"
            columns: ["item_id", "user_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "bill_details_plan_id_user_id_fkey"
            columns: ["plan_id", "user_id"]
            isOneToOne: false
            referencedRelation: "bill_plans"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      bill_plans: {
        Row: {
          active: boolean
          category: string
          created_at: string
          currency: string
          customer_ref: string | null
          id: string
          interval_months: number
          pay_url: string | null
          provider: string
          remind_days_before: number[]
          typical_amount_cents: number | null
          typical_due_day: number | null
          user_id: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          currency?: string
          customer_ref?: string | null
          id?: string
          interval_months?: number
          pay_url?: string | null
          provider: string
          remind_days_before?: number[]
          typical_amount_cents?: number | null
          typical_due_day?: number | null
          user_id?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          currency?: string
          customer_ref?: string | null
          id?: string
          interval_months?: number
          pay_url?: string | null
          provider?: string
          remind_days_before?: number[]
          typical_amount_cents?: number | null
          typical_due_day?: number | null
          user_id?: string
        }
        Relationships: []
      }
      checklist_items: {
        Row: {
          done: boolean
          id: string
          item_id: string
          position: number
          text: string
          user_id: string
        }
        Insert: {
          done?: boolean
          id?: string
          item_id: string
          position?: number
          text: string
          user_id?: string
        }
        Update: {
          done?: boolean
          id?: string
          item_id?: string
          position?: number
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_item_id_user_id_fkey"
            columns: ["item_id", "user_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      items: {
        Row: {
          all_day: boolean
          body_md: string | null
          completed_at: string | null
          context: Database["public"]["Enums"]["context_kind"] | null
          created_at: string
          due_date: string | null
          due_time: string | null
          ends_at: string | null
          id: string
          location: string | null
          priority: number
          project_id: string | null
          recurrence_rrule: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["item_status"]
          title: string
          type: Database["public"]["Enums"]["item_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          body_md?: string | null
          completed_at?: string | null
          context?: Database["public"]["Enums"]["context_kind"] | null
          created_at?: string
          due_date?: string | null
          due_time?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          priority?: number
          project_id?: string | null
          recurrence_rrule?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          title: string
          type: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          all_day?: boolean
          body_md?: string | null
          completed_at?: string | null
          context?: Database["public"]["Enums"]["context_kind"] | null
          created_at?: string
          due_date?: string | null
          due_time?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          priority?: number
          project_id?: string | null
          recurrence_rrule?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          title?: string
          type?: Database["public"]["Enums"]["item_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_project_id_user_id_fkey"
            columns: ["project_id", "user_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          locale: string
          reminder_hour: number
          timezone: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          reminder_hour?: number
          timezone?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          reminder_hour?: number
          timezone?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived: boolean
          color: string | null
          context: Database["public"]["Enums"]["context_kind"] | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string | null
          context?: Database["public"]["Enums"]["context_kind"] | null
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          archived?: boolean
          color?: string | null
          context?: Database["public"]["Enums"]["context_kind"] | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      context_kind: "work" | "personal" | "health" | "finance"
      item_status: "inbox" | "todo" | "doing" | "done" | "cancelled" | "skipped"
      item_type: "task" | "event" | "appointment" | "bill" | "note"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      context_kind: ["work", "personal", "health", "finance"],
      item_status: ["inbox", "todo", "doing", "done", "cancelled", "skipped"],
      item_type: ["task", "event", "appointment", "bill", "note"],
    },
  },
} as const
