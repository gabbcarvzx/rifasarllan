import type { Profile, TenantStatus } from "@/types/database";

export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

export type AuthProfile = Profile & {
  tenant: { status: TenantStatus } | null;
};

export type AuthContext = {
  user: AuthUser | null;
  profile: AuthProfile | null;
};

export type SignUpActionState = {
  status: "idle" | "error";
  message: string;
  updatedAt?: number;
};
