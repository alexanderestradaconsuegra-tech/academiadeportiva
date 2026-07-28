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
      app_secrets: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          player_id: string
          rsvp: string | null
          status: string
          training_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          player_id: string
          rsvp?: string | null
          status: string
          training_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          player_id?: string
          rsvp?: string | null
          status?: string
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatoria_players: {
        Row: {
          confirmed: boolean | null
          convocatoria_id: string
          created_at: string | null
          id: string
          instruction: string | null
          player_id: string
          position_label: string | null
          x: number | null
          y: number | null
        }
        Insert: {
          confirmed?: boolean | null
          convocatoria_id: string
          created_at?: string | null
          id?: string
          instruction?: string | null
          player_id: string
          position_label?: string | null
          x?: number | null
          y?: number | null
        }
        Update: {
          confirmed?: boolean | null
          convocatoria_id?: string
          created_at?: string | null
          id?: string
          instruction?: string | null
          player_id?: string
          position_label?: string | null
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "convocatoria_players_convocatoria_id_fkey"
            columns: ["convocatoria_id"]
            isOneToOne: false
            referencedRelation: "convocatorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convocatoria_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      convocatorias: {
        Row: {
          academy_id: string | null
          created_at: string | null
          formation: string | null
          id: string
          match_id: string
          notes: string | null
        }
        Insert: {
          academy_id?: string | null
          created_at?: string | null
          formation?: string | null
          id?: string
          match_id: string
          notes?: string | null
        }
        Update: {
          academy_id?: string | null
          created_at?: string | null
          formation?: string | null
          id?: string
          match_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convocatorias_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convocatorias_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
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
      exercises: {
        Row: {
          academy_id: string | null
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          id: string
          name: string
          video_url: string | null
        }
        Insert: {
          academy_id?: string | null
          category: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          id?: string
          name: string
          video_url?: string | null
        }
        Update: {
          academy_id?: string | null
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          id?: string
          name?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
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
      injuries: {
        Row: {
          body_part: string
          created_at: string
          date_return: string | null
          date_start: string
          id: string
          injury_type: string
          is_recovered: boolean
          notes: string | null
          player_id: string
          severity: string
        }
        Insert: {
          body_part: string
          created_at?: string
          date_return?: string | null
          date_start: string
          id?: string
          injury_type: string
          is_recovered?: boolean
          notes?: string | null
          player_id: string
          severity: string
        }
        Update: {
          body_part?: string
          created_at?: string
          date_return?: string | null
          date_start?: string
          id?: string
          injury_type?: string
          is_recovered?: boolean
          notes?: string | null
          player_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "injuries_player_id_fkey"
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
      match_player_stats: {
        Row: {
          assists: number
          created_at: string
          goals: number
          highlight_url: string | null
          id: string
          match_id: string
          minutes_played: number
          notes: string | null
          player_id: string
          position_played: string | null
          rating: number | null
          red_cards: number
          yellow_cards: number
        }
        Insert: {
          assists?: number
          created_at?: string
          goals?: number
          highlight_url?: string | null
          id?: string
          match_id: string
          minutes_played?: number
          notes?: string | null
          player_id: string
          position_played?: string | null
          rating?: number | null
          red_cards?: number
          yellow_cards?: number
        }
        Update: {
          assists?: number
          created_at?: string
          goals?: number
          highlight_url?: string | null
          id?: string
          match_id?: string
          minutes_played?: number
          notes?: string | null
          player_id?: string
          position_played?: string | null
          rating?: number | null
          red_cards?: number
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          academy_id: string | null
          category: Database["public"]["Enums"]["category"] | null
          competition: string | null
          created_at: string
          date: string
          id: string
          is_home: boolean
          location: string | null
          notes: string | null
          opponent: string
          opponent_score: number | null
          our_score: number | null
          time: string | null
          video_url: string | null
        }
        Insert: {
          academy_id?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          competition?: string | null
          created_at?: string
          date: string
          id?: string
          is_home?: boolean
          location?: string | null
          notes?: string | null
          opponent: string
          opponent_score?: number | null
          our_score?: number | null
          time?: string | null
          video_url?: string | null
        }
        Update: {
          academy_id?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          competition?: string | null
          created_at?: string
          date?: string
          id?: string
          is_home?: boolean
          location?: string | null
          notes?: string | null
          opponent?: string
          opponent_score?: number | null
          our_score?: number | null
          time?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          concept: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_date: string | null
          player_id: string
          status: string
        }
        Insert: {
          amount: number
          concept: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          player_id: string
          status?: string
        }
        Update: {
          amount?: number
          concept?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          player_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_tests: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          player_id: string
          test_type: string
          unit: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          player_id: string
          test_type: string
          unit: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          player_id?: string
          test_type?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "physical_tests_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          academy_id: string | null
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
          academy_id?: string | null
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
          academy_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "players_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      position_samples: {
        Row: {
          created_at: string
          id: string
          player_id: string
          session_label: string
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          session_label: string
          x: number
          y: number
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          session_label?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "position_samples_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academy_id: string | null
          category: Database["public"]["Enums"]["category"] | null
          created_at: string
          full_name: string | null
          id: string
          player_id: string | null
          role: string
        }
        Insert: {
          academy_id?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          full_name?: string | null
          id: string
          player_id?: string | null
          role: string
        }
        Update: {
          academy_id?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          full_name?: string | null
          id?: string
          player_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
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
      tactics_plays: {
        Row: {
          academy_id: string | null
          created_at: string
          id: string
          lines: Json
          markers: Json
          name: string
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          id?: string
          lines?: Json
          markers?: Json
          name: string
        }
        Update: {
          academy_id?: string | null
          created_at?: string
          id?: string
          lines?: Json
          markers?: Json
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tactics_plays_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      team_settings: {
        Row: {
          calib_p0_lat: number | null
          calib_p0_lng: number | null
          calib_p1_lat: number | null
          calib_p1_lng: number | null
          calib_p2_lat: number | null
          calib_p2_lng: number | null
          city: string | null
          description: string | null
          founded_year: number | null
          id: string
          language: string
          logo_url: string | null
          monthly_fee: number | null
          name: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          calib_p0_lat?: number | null
          calib_p0_lng?: number | null
          calib_p1_lat?: number | null
          calib_p1_lng?: number | null
          calib_p2_lat?: number | null
          calib_p2_lng?: number | null
          city?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          language?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          calib_p0_lat?: number | null
          calib_p0_lng?: number | null
          calib_p1_lat?: number | null
          calib_p1_lng?: number | null
          calib_p2_lat?: number | null
          calib_p2_lng?: number | null
          city?: string | null
          description?: string | null
          founded_year?: number | null
          id?: string
          language?: string
          logo_url?: string | null
          monthly_fee?: number | null
          name?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_schedules: {
        Row: {
          category: string | null
          created_at: string
          day_of_week: number
          id: string
          location: string
          notes: string
          time: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          location?: string
          notes?: string
          time?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          location?: string
          notes?: string
          time?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          academy_id: string | null
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
          academy_id?: string | null
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
          academy_id?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          date?: string
          id?: string
          location?: string | null
          notes?: string | null
          time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "team_settings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_academy_with_code: {
        Args: {
          p_coach_name: string
          p_code: string
          p_language: string
          p_name: string
        }
        Returns: string
      }
      current_player_id: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
      get_my_academy_id: { Args: never; Returns: string }
      get_my_category: {
        Args: never
        Returns: Database["public"]["Enums"]["category"]
      }
      get_my_player_id: { Args: never; Returns: string }
      is_coach: { Args: never; Returns: boolean }
      is_staff_for_category: {
        Args: { p_category: Database["public"]["Enums"]["category"] }
        Returns: boolean
      }
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
        | "Sub-5"
        | "Sub-6"
        | "Sub-7"
        | "Sub-8"
        | "Sub-9"
        | "Sub-10"
        | "Sub-11"
        | "Sub-12"
        | "Sub-13"
        | "Sub-14"
        | "Sub-15"
        | "Otra"
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
      activity_category: ["Velocidad","Fuerza","Técnica","Resistencia","Potencia","Agilidad","Pliometría"],
      activity_unit: ["segundos", "kg", "repeticiones", "metros", "puntos"],
      category: ["Sub-5","Sub-6","Sub-7","Sub-8","Sub-9","Sub-10","Sub-11","Sub-12","Sub-13","Sub-14","Sub-15","Otra"],
      device_type: ["polar_h10","wahoo_tickr","garmin_hrm","generic_ble","manual"],
      dominant_foot: ["Derecha", "Izquierda", "Ambidiestro"],
      intensity: ["Baja", "Media", "Alta"],
      position: ["Portero","Defensa Central","Lateral Derecho","Lateral Izquierdo","Mediocampista Defensivo","Mediocampista Central","Mediocampista Ofensivo","Extremo Derecho","Extremo Izquierdo","Delantero Centro","Segundo Delantero"],
    },
  },
} as const
