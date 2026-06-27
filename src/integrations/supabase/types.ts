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
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      certificates: {
        Row: {
          code: string
          event_id: string
          event_name_snapshot: string | null
          file_url: string | null
          id: string
          issued_at: string
          issued_by: string | null
          member_id: string | null
          metadata: Json
          recipient_email: string | null
          recipient_name: string | null
        }
        Insert: {
          code: string
          event_id: string
          event_name_snapshot?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          member_id?: string | null
          metadata?: Json
          recipient_email?: string | null
          recipient_name?: string | null
        }
        Update: {
          code?: string
          event_id?: string
          event_name_snapshot?: string | null
          file_url?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          member_id?: string | null
          metadata?: Json
          recipient_email?: string | null
          recipient_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      city_club_applications: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          applicant_user_id: string | null
          city: string
          committed_members: number
          country: string | null
          created_at: string
          id: string
          motivation: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          applicant_user_id?: string | null
          city: string
          committed_members?: number
          country?: string | null
          created_at?: string
          id?: string
          motivation?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          applicant_user_id?: string | null
          city?: string
          committed_members?: number
          country?: string | null
          created_at?: string
          id?: string
          motivation?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string
          csr_focus: string | null
          description: string | null
          id: string
          industry: string | null
          location: string | null
          name: string
          notes: string | null
          recent_news: string | null
          target_audience: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          csr_focus?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          notes?: string | null
          recent_news?: string | null
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          csr_focus?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          recent_news?: string | null
          target_audience?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          linkedin_url: string | null
          name: string
          phone: string | null
          title: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name: string
          phone?: string | null
          title?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          doc_type: string | null
          event_id: string | null
          file_url: string
          id: string
          name: string
          sponsor_id: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          doc_type?: string | null
          event_id?: string | null
          file_url: string
          id?: string
          name: string
          sponsor_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          doc_type?: string | null
          event_id?: string | null
          file_url?: string
          id?: string
          name?: string
          sponsor_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          created_at: string
          email: string
          event_id: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          event_id: string
          sponsor_id: string
        }
        Insert: {
          event_id: string
          sponsor_id: string
        }
        Update: {
          event_id?: string
          sponsor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string | null
          expected_attendees: number | null
          id: string
          judges: string[] | null
          name: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          expected_attendees?: number | null
          id?: string
          judges?: string[] | null
          name: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string | null
          expected_attendees?: number | null
          id?: string
          judges?: string[] | null
          name?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      internship_interests: {
        Row: {
          created_at: string
          internship_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          internship_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          internship_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internship_interests_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          apply_by: string | null
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          posted_by: string | null
          title: string
        }
        Insert: {
          apply_by?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          posted_by?: string | null
          title: string
        }
        Update: {
          apply_by?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          posted_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_templates: {
        Row: {
          created_at: string
          id: string
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentor_assignments: {
        Row: {
          assigned_at: string
          mentee_id: string
          mentor_id: string
        }
        Insert: {
          assigned_at?: string
          mentee_id: string
          mentor_id: string
        }
        Update: {
          assigned_at?: string
          mentee_id?: string
          mentor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          expertise: string[] | null
          id: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          channel: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          scheduled_at: string | null
          status: string
          title: string | null
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string | null
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          college: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          join_date: string
          skills: string[] | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          college?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          join_date?: string
          skills?: string[] | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          college?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          join_date?: string
          skills?: string[] | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          amount: number | null
          created_at: string
          event_id: string | null
          file_url: string | null
          id: string
          sent_at: string | null
          sponsor_id: string
          status: string
          tier: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          event_id?: string | null
          file_url?: string | null
          id?: string
          sent_at?: string | null
          sponsor_id: string
          status?: string
          tier?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          event_id?: string | null
          file_url?: string | null
          id?: string
          sent_at?: string | null
          sponsor_id?: string
          status?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          company_id: string
          contact_id: string | null
          created_at: string
          expected_amount: number | null
          id: string
          next_follow_up: string | null
          notes: string | null
          owner_id: string | null
          sort_index: number
          status: Database["public"]["Enums"]["sponsor_status"]
          tier: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          contact_id?: string | null
          created_at?: string
          expected_amount?: number | null
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          owner_id?: string | null
          sort_index?: number
          status?: Database["public"]["Enums"]["sponsor_status"]
          tier?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          contact_id?: string | null
          created_at?: string
          expected_amount?: number | null
          id?: string
          next_follow_up?: string | null
          notes?: string | null
          owner_id?: string | null
          sort_index?: number
          status?: Database["public"]["Enums"]["sponsor_status"]
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsors_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          related_id: string | null
          related_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          created_at: string
          id: string
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_certificate_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "team_member" | "member"
      sponsor_status:
        | "lead"
        | "researching"
        | "email_sent"
        | "linkedin_sent"
        | "meeting_scheduled"
        | "proposal_shared"
        | "negotiation"
        | "won"
        | "lost"
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
    Enums: {
      app_role: ["admin", "team_member", "member"],
      sponsor_status: [
        "lead",
        "researching",
        "email_sent",
        "linkedin_sent",
        "meeting_scheduled",
        "proposal_shared",
        "negotiation",
        "won",
        "lost",
      ],
    },
  },
} as const
