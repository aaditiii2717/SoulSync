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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_questions: {
        Row: {
          id: string
          created_at: string
          question: string
          category: string | null
          relate_count: number | null
          responses_count: number | null
          is_public: boolean | null
          alias_id: string | null
          answer: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          question: string
          category?: string | null
          relate_count?: number | null
          responses_count?: number | null
          is_public?: boolean | null
          alias_id?: string | null
          answer?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          question?: string
          category?: string | null
          relate_count?: number | null
          responses_count?: number | null
          is_public?: boolean | null
          alias_id?: string | null
          answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_alias_id_fkey"
            columns: ["alias_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["alias_id"]
          }
        ]
      }
      qna_responses: {
        Row: {
          id: string
          created_at: string
          question_id: string | null
          response_text: string
          alias_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          question_id?: string | null
          response_text: string
          alias_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          question_id?: string | null
          response_text?: string
          alias_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qna_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qna_responses_alias_id_fkey"
            columns: ["alias_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["alias_id"]
          }
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_alias_id: string | null
          id: string
          ngo_id: string | null
          status: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_alias_id?: string | null
          id?: string
          ngo_id?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_alias_id?: string | null
          id?: string
          ngo_id?: string | null
          status?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_alias_id_fkey"
            columns: ["donor_alias_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["alias_id"]
          },
          {
            foreignKeyName: "donations_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          alias_id: string | null
          created_at: string
          id: string
          mood: string
          note: string | null
        }
        Insert: {
          alias_id?: string | null
          created_at?: string
          id?: string
          mood: string
          note?: string | null
        }
        Update: {
          alias_id?: string | null
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_alias_id_fkey"
            columns: ["alias_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["alias_id"]
          },
        ]
      }
      ngos: {
        Row: {
          category: string
          contact_email: string
          created_at: string
          description: string | null
          donation_link: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          name: string
        }
        Insert: {
          category: string
          contact_email: string
          created_at?: string
          description?: string | null
          donation_link?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
        }
        Update: {
          category?: string
          contact_email?: string
          created_at?: string
          description?: string | null
          donation_link?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          ai_session_summary: string | null
          anonymous_name: string
          created_at: string
          handoff_briefing: string | null
          id: string
          issue_type: string
          language_preference: string
          meeting_token: string | null
          mood_after: string | null
          mood_before: string | null
          notes: string | null
          reminder_sent: boolean
          status: string
          student_alias_id: string | null
          time_slot_id: string
          volunteer_id: string | null
          volunteer_notes: string | null
        }
        Insert: {
          ai_session_summary?: string | null
          anonymous_name?: string
          created_at?: string
          handoff_briefing?: string | null
          id?: string
          issue_type: string
          language_preference?: string
          meeting_token?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          reminder_sent?: boolean
          status?: string
          student_alias_id?: string | null
          time_slot_id: string
          volunteer_id?: string | null
          volunteer_notes?: string | null
        }
        Update: {
          ai_session_summary?: string | null
          anonymous_name?: string
          created_at?: string
          handoff_briefing?: string | null
          id?: string
          issue_type?: string
          language_preference?: string
          meeting_token?: string | null
          mood_after?: string | null
          mood_before?: string | null
          notes?: string | null
          reminder_sent?: boolean
          status?: string
          student_alias_id?: string | null
          time_slot_id?: string
          volunteer_id?: string | null
          volunteer_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_bookings_student_alias_id_fkey"
            columns: ["student_alias_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["alias_id"]
          },
          {
            foreignKeyName: "session_bookings_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          alias_id: string
          anonymous_username: string
          created_at: string
          memory_context: string | null
          primary_volunteer_id: string | null
          recovery_hash: string | null
          recovery_key_hash: string | null
          username: string | null
        }
        Insert: {
          alias_id?: string
          anonymous_username: string
          created_at?: string
          memory_context?: string | null
          primary_volunteer_id?: string | null
          recovery_hash?: string | null
          recovery_key_hash?: string | null
          username?: string | null
        }
        Update: {
          alias_id?: string
          anonymous_username?: string
          created_at?: string
          memory_context?: string | null
          primary_volunteer_id?: string | null
          recovery_hash?: string | null
          recovery_key_hash?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_primary_volunteer_id_fkey"
            columns: ["primary_volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_booked: boolean
          slot_date: string
          start_time: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_booked?: boolean
          slot_date: string
          start_time: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          slot_date?: string
          start_time?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          bio: string | null
          created_at: string
          cv_storage_path: string | null
          cv_url: string | null
          email: string
          expertise: string[]
          id: string
          is_active: boolean
          is_admin: boolean | null
          is_deactivated: boolean | null
          is_verified: boolean
          languages: string[]
          name: string
          rating_summary: Json | null
          total_sessions: number | null
          verification_status: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          cv_storage_path?: string | null
          cv_url?: string | null
          email: string
          expertise?: string[]
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          is_deactivated?: boolean | null
          is_verified?: boolean
          languages?: string[]
          name: string
          rating_summary?: Json | null
          total_sessions?: number | null
          verification_status?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          cv_storage_path?: string | null
          cv_url?: string | null
          email?: string
          expertise?: string[]
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          is_deactivated?: boolean | null
          is_verified?: boolean
          languages?: string[]
          name?: string
          rating_summary?: Json | null
          total_sessions?: number | null
          verification_status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_due_session_reminders: {
        Args: Record<PropertyKey, never>
        Returns: {
          booking_id: string
          anonymous_name: string
          meeting_token: string | null
          volunteer_email: string
          volunteer_name: string
          slot_date: string
          start_time: string
        }[]
      }
      increment_response_count: {
        Args: { question_id: string }
        Returns: undefined
      }
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
