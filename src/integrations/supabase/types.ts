export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          coverimage: string | null
          createdat: string | null
          description: string | null
          id: string
          isdeleted: boolean | null
          lastmodified: number | null
          name: string
          totalstickers: number
          updatedat: string | null
          year: string | null
        }
        Insert: {
          coverimage?: string | null
          createdat?: string | null
          description?: string | null
          id: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          name: string
          totalstickers: number
          updatedat?: string | null
          year?: string | null
        }
        Update: {
          coverimage?: string | null
          createdat?: string | null
          description?: string | null
          id?: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          name?: string
          totalstickers?: number
          updatedat?: string | null
          year?: string | null
        }
        Relationships: []
      }
      exchange_offers: {
        Row: {
          albumid: string
          color: string | null
          createdat: string | null
          exchangemethod: string | null
          id: string
          isdeleted: boolean | null
          lastmodified: number | null
          location: string | null
          offeredstickerid: string[]
          offeredstickername: string
          phone: string | null
          status: string
          updatedat: string | null
          useravatar: string | null
          userid: string | null
          username: string
          wantedstickerid: string[]
          wantedstickername: string
        }
        Insert: {
          albumid: string
          color?: string | null
          createdat?: string | null
          exchangemethod?: string | null
          id: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          location?: string | null
          offeredstickerid: string[]
          offeredstickername: string
          phone?: string | null
          status?: string
          updatedat?: string | null
          useravatar?: string | null
          userid?: string | null
          username: string
          wantedstickerid: string[]
          wantedstickername: string
        }
        Update: {
          albumid?: string
          color?: string | null
          createdat?: string | null
          exchangemethod?: string | null
          id?: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          location?: string | null
          offeredstickerid?: string[]
          offeredstickername?: string
          phone?: string | null
          status?: string
          updatedat?: string | null
          useravatar?: string | null
          userid?: string | null
          username?: string
          wantedstickerid?: string[]
          wantedstickername?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_offers_albumid_fkey"
            columns: ["albumid"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      stickers: {
        Row: {
          albumid: string
          category: string
          createdat: string | null
          duplicatecount: number | null
          id: string
          imageurl: string | null
          isdeleted: boolean | null
          isduplicate: boolean
          isowned: boolean
          lastmodified: number | null
          name: string
          number: string
          team: string
          teamlogo: string | null
          updatedat: string | null
        }
        Insert: {
          albumid: string
          category: string
          createdat?: string | null
          duplicatecount?: number | null
          id: string
          imageurl?: string | null
          isdeleted?: boolean | null
          isduplicate?: boolean
          isowned?: boolean
          lastmodified?: number | null
          name: string
          number: string
          team: string
          teamlogo?: string | null
          updatedat?: string | null
        }
        Update: {
          albumid?: string
          category?: string
          createdat?: string | null
          duplicatecount?: number | null
          id?: string
          imageurl?: string | null
          isdeleted?: boolean | null
          isduplicate?: boolean
          isowned?: boolean
          lastmodified?: number | null
          name?: string
          number?: string
          team?: string
          teamlogo?: string | null
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stickers_albumid_fkey"
            columns: ["albumid"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          createdat: string | null
          duplicatestickers: number
          id: string
          isdeleted: boolean | null
          lastmodified: number | null
          location: string | null
          name: string
          neededstickers: number
          ownedstickers: number
          phone: string | null
          totalstickers: number
          updatedat: string | null
        }
        Insert: {
          avatar?: string | null
          createdat?: string | null
          duplicatestickers?: number
          id: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          location?: string | null
          name: string
          neededstickers?: number
          ownedstickers?: number
          phone?: string | null
          totalstickers?: number
          updatedat?: string | null
        }
        Update: {
          avatar?: string | null
          createdat?: string | null
          duplicatestickers?: number
          id?: string
          isdeleted?: boolean | null
          lastmodified?: number | null
          location?: string | null
          name?: string
          neededstickers?: number
          ownedstickers?: number
          phone?: string | null
          totalstickers?: number
          updatedat?: string | null
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
