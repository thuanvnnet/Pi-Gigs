// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const supabase = createClient(env.supabase.url, env.supabase.anonKey);