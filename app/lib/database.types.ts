export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: { id: string; game_name: string; player_count: number; rule: string; amount_per_person: number; owner_address: string; status: string; contact_info: string; created_at: string; };
        Insert: { id?: string; game_name: string; player_count: number; rule: string; amount_per_person: number; owner_address: string; status?: string; contact_info?: string; created_at?: string; };
        Update: { status?: string; [key: string]: string | number | boolean | null | undefined; };
      }
    }
  }
}