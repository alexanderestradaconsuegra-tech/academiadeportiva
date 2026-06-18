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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_category:
        | "Velocidad"
        | "Fuerza"
        | "Técnica"
        | "Resistencia"
        | "Potencia"
        | "Pliometría"
        | "Agilidad"
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

type DefaultSchema = Database["public"]

export type Tables<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions]["Row"]

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions]["Insert"]

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"],
> = DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions]["Update"]

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"],
> = DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
