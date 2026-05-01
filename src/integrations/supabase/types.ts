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
      car_rentals: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          car_type: string | null
          company_name: string | null
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          owner_id: string
          pickup_datetime: string | null
          pickup_location: string | null
          return_datetime: string | null
          return_location: string | null
        }
        Insert: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          car_type?: string | null
          company_name?: string | null
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          owner_id?: string
          pickup_datetime?: string | null
          pickup_location?: string | null
          return_datetime?: string | null
          return_location?: string | null
        }
        Update: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          car_type?: string | null
          company_name?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          owner_id?: string
          pickup_datetime?: string | null
          pickup_location?: string | null
          return_datetime?: string | null
          return_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_rentals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          id: string
          owner_id: string
          source: Database["public"]["Enums"]["conversation_source"]
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          id?: string
          owner_id?: string
          source?: Database["public"]["Enums"]["conversation_source"]
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          owner_id?: string
          source?: Database["public"]["Enums"]["conversation_source"]
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          amount_paid: number | null
          created_at: string
          destination: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          payment_status: string | null
          phone: string | null
          pnr: string | null
          status: string | null
          total_price: number | null
          travel_end_date: string | null
          travel_start_date: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id?: string
          payment_status?: string | null
          phone?: string | null
          pnr?: string | null
          status?: string | null
          total_price?: number | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          payment_status?: string | null
          phone?: string | null
          pnr?: string | null
          status?: string | null
          total_price?: number | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"] | null
          customer_id: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          owner_id: string
          uploaded_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"] | null
          customer_id: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          owner_id?: string
          uploaded_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"] | null
          customer_id?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          owner_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          airline: string | null
          arrival_airport: string | null
          arrival_datetime: string | null
          check_in_status: Database["public"]["Enums"]["check_status"] | null
          created_at: string
          customer_id: string
          departure_airport: string | null
          departure_datetime: string | null
          flight_number: string | null
          id: string
          insurance_status: Database["public"]["Enums"]["check_status"] | null
          notes: string | null
          owner_id: string
          pnr: string | null
          ticket_status: Database["public"]["Enums"]["check_status"] | null
          updated_at: string
        }
        Insert: {
          airline?: string | null
          arrival_airport?: string | null
          arrival_datetime?: string | null
          check_in_status?: Database["public"]["Enums"]["check_status"] | null
          created_at?: string
          customer_id: string
          departure_airport?: string | null
          departure_datetime?: string | null
          flight_number?: string | null
          id?: string
          insurance_status?: Database["public"]["Enums"]["check_status"] | null
          notes?: string | null
          owner_id?: string
          pnr?: string | null
          ticket_status?: Database["public"]["Enums"]["check_status"] | null
          updated_at?: string
        }
        Update: {
          airline?: string | null
          arrival_airport?: string | null
          arrival_datetime?: string | null
          check_in_status?: Database["public"]["Enums"]["check_status"] | null
          created_at?: string
          customer_id?: string
          departure_airport?: string | null
          departure_datetime?: string | null
          flight_number?: string | null
          id?: string
          insurance_status?: Database["public"]["Enums"]["check_status"] | null
          notes?: string | null
          owner_id?: string
          pnr?: string | null
          ticket_status?: Database["public"]["Enums"]["check_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flights_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          check_in_date: string | null
          check_out_date: string | null
          city: string | null
          created_at: string
          customer_id: string
          hotel_name: string | null
          id: string
          notes: string | null
          number_of_guests: number | null
          owner_id: string
          room_type: string | null
        }
        Insert: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          check_in_date?: string | null
          check_out_date?: string | null
          city?: string | null
          created_at?: string
          customer_id: string
          hotel_name?: string | null
          id?: string
          notes?: string | null
          number_of_guests?: number | null
          owner_id?: string
          room_type?: string | null
        }
        Update: {
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          check_in_date?: string | null
          check_out_date?: string | null
          city?: string | null
          created_at?: string
          customer_id?: string
          hotel_name?: string | null
          id?: string
          notes?: string | null
          number_of_guests?: number | null
          owner_id?: string
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotels_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_leads: {
        Row: {
          created_at: string
          destination: string | null
          email: string | null
          id: string
          message: string | null
          name: string
          number_of_travelers: number | null
          phone: string | null
          source: string | null
          status: string | null
          travel_end_date: string | null
          travel_start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name: string
          number_of_travelers?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          number_of_travelers?: number | null
          phone?: string | null
          source?: string | null
          status?: string | null
          travel_end_date?: string | null
          travel_start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          method: Database["public"]["Enums"]["payment_method"] | null
          notes: string | null
          owner_id: string
          payment_date: string
          payment_type: Database["public"]["Enums"]["payment_type"] | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          owner_id?: string
          payment_date?: string
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          owner_id?: string
          payment_date?: string
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          customer_id: string | null
          description: string | null
          due_date: string | null
          id: string
          owner_id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bot_state: {
        Row: {
          id: number
          update_offset: number
          updated_at: string
        }
        Insert: {
          id: number
          update_offset?: number
          updated_at?: string
        }
        Update: {
          id?: number
          update_offset?: number
          updated_at?: string
        }
        Relationships: []
      }
      telegram_chat_links: {
        Row: {
          chat_id: number
          created_at: string
          first_name: string | null
          id: string
          owner_id: string
          paired_at: string | null
          pairing_code: string | null
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          first_name?: string | null
          id?: string
          owner_id: string
          paired_at?: string | null
          pairing_code?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          first_name?: string | null
          id?: string
          owner_id?: string
          paired_at?: string | null
          pairing_code?: string | null
          username?: string | null
        }
        Relationships: []
      }
      telegram_messages: {
        Row: {
          ai_response: Json | null
          chat_id: number
          created_at: string
          error: string | null
          owner_id: string | null
          raw_update: Json
          reply_text: string | null
          status: string
          text: string | null
          update_id: number
        }
        Insert: {
          ai_response?: Json | null
          chat_id: number
          created_at?: string
          error?: string | null
          owner_id?: string | null
          raw_update: Json
          reply_text?: string | null
          status?: string
          text?: string | null
          update_id: number
        }
        Update: {
          ai_response?: Json | null
          chat_id?: number
          created_at?: string
          error?: string | null
          owner_id?: string | null
          raw_update?: Json
          reply_text?: string | null
          status?: string
          text?: string | null
          update_id?: number
        }
        Relationships: []
      }
      telegram_pairing_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          owner_id: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          owner_id: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          owner_id?: string
          used_at?: string | null
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          owner_id: string | null
          parsed_action: Json | null
          raw_message: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          owner_id?: string | null
          parsed_action?: Json | null
          raw_message: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          owner_id?: string | null
          parsed_action?: Json | null
          raw_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_updates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          id: string
          owner_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          owner_id?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          owner_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          created_at: string
          customer_id: string
          datetime: string | null
          destination: string | null
          id: string
          notes: string | null
          number_of_passengers: number | null
          owner_id: string
          pickup_location: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          supplier: string | null
          transfer_type: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          datetime?: string | null
          destination?: string | null
          id?: string
          notes?: string | null
          number_of_passengers?: number | null
          owner_id?: string
          pickup_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          supplier?: string | null
          transfer_type?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          datetime?: string | null
          destination?: string | null
          id?: string
          notes?: string | null
          number_of_passengers?: number | null
          owner_id?: string
          pickup_location?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          supplier?: string | null
          transfer_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled"
      check_status: "pending" | "done" | "not_required"
      conversation_source: "whatsapp" | "telegram" | "manual"
      document_category:
        | "passport"
        | "flight_ticket"
        | "hotel_voucher"
        | "visa"
        | "insurance"
        | "invoice"
        | "supplier_document"
        | "other"
      payment_method: "cash" | "bank_transfer" | "credit_card" | "other"
      payment_type: "deposit" | "full" | "refund"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "done" | "cancelled"
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
      booking_status: ["pending", "confirmed", "cancelled"],
      check_status: ["pending", "done", "not_required"],
      conversation_source: ["whatsapp", "telegram", "manual"],
      document_category: [
        "passport",
        "flight_ticket",
        "hotel_voucher",
        "visa",
        "insurance",
        "invoice",
        "supplier_document",
        "other",
      ],
      payment_method: ["cash", "bank_transfer", "credit_card", "other"],
      payment_type: ["deposit", "full", "refund"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "done", "cancelled"],
    },
  },
} as const
