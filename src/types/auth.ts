import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

export type AuthContext = {
  user: User | null;
  profile: Profile | null;
};
