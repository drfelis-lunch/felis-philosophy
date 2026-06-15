import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 워크스페이스 도메인 (이중 안전장치 — GCP 내부앱이 1차, 이게 2차)
export const ALLOWED_DOMAIN = "drfelis.com";
