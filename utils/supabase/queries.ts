import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getSupabase() {
  return createClient();
}

export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getProfile(userId?: string): Promise<Profile | null> {
  const supabase = await createClient();
  const user = userId ? { id: userId } : await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, is_active, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return data as Profile | null;
}

export async function getIsAdmin() {
  const profile = await getProfile();
  return profile?.role === "admin";
}
