export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          userid: string
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
          userid: string
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
          userid?: string
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
          {
            foreignKeyName: "exchange_offers_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
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
          number: number
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
          number: number
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
          number?: number
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
