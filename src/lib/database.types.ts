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
      activities: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          date: string
          exercise: string
          id: string
          intensity: Database["public"]["Enums"]["intensity"]
          notes: string | null
          player_id: string
          unit: Database["public"]["Enums"]["activity_unit"]
          value: number
        }
        Insert: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          date: string
          exercise: string
          id?: string
          intensity: Database["public"]["Enums"]["intensity"]
          notes?: string | null
          player_id: string
          unit: Database["public"]["Enums"]["activity_unit"]
          value: number
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          date?: string
          exercise?: string
          id?: string
          intensity?: Database["public"]["Enums"]["intensity"]
          notes?: string | null
          player_id?: string
          unit?: Database["public"]["Enums"]["activity_unit"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "activities_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          agility_score: number
          date: string
          general_score: number
          id: string
          player_id: string
          power_score: number
          resistance_score: number
          speed_score: number
          strength_score: number
          technique_score: number
        }
        Insert: {
          agility_score: number
          date: string
          general_score: number
          id?: string
          player_id: string
          power_score: number
          resistance_score: number
          speed_score: number
          strength_score: number
          technique_score: number
        }
        Update: {
          agility_score?: number
          date?: string
          general_score?: number
          id?: string
          player_id?: string
          power_score?: number
          resistance_score?: number
          speed_score?: number
          strength_score?: number
          technique_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      health_profiles: {
        Row: {
          blood_pressure_dia: number | null
          blood_pressure_sys: number | null
          body_fat_pct: number | null
          date: string
          hrv: number | null
          id: string
          max_hr: number | null
          player_id: string
          recovery_index: number | null
          resting_hr: number | null
          vo2max: number | null
          weight: number | null
        }
        Insert: {
          blood_pressure_dia?: number | null
          blood_pressure_sys?: number | null
          body_fat_pct?: number | null
          date: string
          hrv?: number | null
          id?: string
          max_hr?: number | null
          player_id: string
          recovery_index?: number | null
          resting_hr?: number | null
          vo2max?: number | null
          weight?: number | null
        }
        Update: {
          blood_pressure_dia?: number | null
          blood_pressure_sys?: number | null
          body_fat_pct?: number | null
          date?: string
          hrv?: number | null
          id?: string
          max_hr?: number | null
          player_id?: string
          recovery_index?: number | null
          resting_hr?: number | null
          vo2max?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          avg_hr: number | null
          avg_speed_kmh: number | null
          calories_est: number | null
          device_name: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          distance_m: number | null
          duration_s: number | null
          ended_at: string | null
          hr_samples: Json
          id: string
          max_hr_session: number | null
          max_speed_kmh: number | null
          min_hr_session: number | null
          notes: string | null
          player_id: string
          speed_samples: Json
          started_at: string
        }
        Insert: {
          avg_hr?: number | null
          avg_speed_kmh?: number | null
          calories_est?: number | null
          device_name?: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          distance_m?: number | null
          duration_s?: number | null
          ended_at?: string | null
          hr_samples?: Json
          id?: string
          max_hr_session?: number | null
          max_speed_kmh?: number | null
          min_hr_session?: number | null
          notes?: string | null
          player_id: string
          speed_samples?: Json
          started_at: string
        }
        Update: {
          avg_hr?: number | null
          avg_speed_kmh?: number | null
          calories_est?: number | null
          device_name?: string | null
          device_type?: Database["public"]["Enums"]["device_type"]
          distance_m?: number | null
          duration_s?: number | null
          ended_at?: string | null
          hr_samples?: Json
          id?: string
          max_hr_session?: number | null
          max_speed_kmh?: number | null
          min_hr_session?: number | null
          notes?: string | null
          player_id?: string
          speed_samples?: Json
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          birth_date: string
          category: Database["public"]["Enums"]["category"]
          club: string | null
          created_at: string
          dominant_foot: Database["public"]["Enums"]["dominant_foot"]
          height: number
          id: string
          name: string
          notes: string | null
          objective: string | null
          photo_url: string | null
          position: Database["public"]["Enums"]["position"]
          weight: number
        }
        Insert: {
          age: number
          birth_date: string
          category: Database["public"]["Enums"]["category"]
          club?: string | null
          created_at?: string
          dominant_foot: Database["public"]["Enums"]["dominant_foot"]
          height: number
          id?: string
          name: string
          notes?: string | null
          objective?: string | null
          photo_url?: string | null
          position: Database["public"]["Enums"]["position"]
          weight: number
        }
        Update: {
          age?: number
          birth_date?: string
          category?: Database["public"]["Enums"]["category"]
          club?: string | null
          created_at?: string
          dominant_foot?: Database["public"]["Enums"]["dominant_foot"]
          height?: number
          id?: string
          name?: string
          notes?: string | null
          objective?: string | null
          photo_url?: string | null
          position?: Database["public"]["Enums"]["position"]
          weight?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          player_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          player_id?: string | null
          role: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          player_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          profile_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          profile_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_settings: {
        Row: {
          city: string | null
          description: string | null
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          category: Database["public"]["Enums"]["category"] | null
          created_at: string
          date: string
          id: string
          location: string | null
          notes: string | null
          time: string | null
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          date: string
          id?: string
          location?: string | null
          notes?: string | null
          time?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          notes?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_player_id: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
    }
    Enums: {
      activity_category:
        | "Velocidad"
        | "Fuerza"
        | "Técnica"
        | "Resistencia"
        | "Potencia"
        | "Agilidad"
        | "Pliometría"
      activity_unit: "segundos" | "kg" | "repeticiones" | "metros" | "puntos"
      category:
        | "Sub-10"
        | "Sub-12"
        | "Sub-14"
        | "Sub-16"
        | "Sub-18"
        | "Juvenil"
        | "Senior"
      device_type:
        | "polar_h10"
        | "wahoo_tickr"
        | "garmin_hrm"
        | "generic_ble"
        | "manual"
      dominant_foot: "Derecha" | "Izquierda" | "Ambidiestro"
      intensity: "Baja" | "Media" | "Alta"
      position:
        | "Portero"
        | "Defensa Central"
        | "Lateral Derecho"
        | "Lateral Izquierdo"
        | "Mediocampista Defensivo"
        | "Mediocampista Central"
        | "Mediocampista Ofensivo"
        | "Extremo Derecho"
        | "Extremo Izquierdo"
        | "Delantero Centro"
        | "Segundo Delantero"
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
      activity_category: [
        "Velocidad",
        "Fuerza",
        "Técnica",
        "Resistencia",
        "Potencia",
        "Agilidad",
        "Pliometría",
      ],
      activity_unit: ["segundos", "kg", "repeticiones", "metros", "puntos"],
      category: [
        "Sub-10",
        "Sub-12",
        "Sub-14",
        "Sub-16",
        "Sub-18",
        "Juvenil",
        "Senior",
      ],
      device_type: [
        "polar_h10",
        "wahoo_tickr",
        "garmin_hrm",
        "generic_ble",
        "manual",
      ],
      dominant_foot: ["Derecha", "Izquierda", "Ambidiestro"],
      intensity: ["Baja", "Media", "Alta"],
      position: [
        "Portero",
        "Defensa Central",
        "Lateral Derecho",
        "Lateral Izquierdo",
        "Mediocampista Defensivo",
        "Mediocampista Central",
        "Mediocampista Ofensivo",
        "Extremo Derecho",
        "Extremo Izquierdo",
        "Delantero Centro",
        "Segundo Delantero",
      ],
    },
  },
} as const
