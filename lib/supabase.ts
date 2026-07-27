import { createClient } from "@supabase/supabase-js";
<<<<<<< HEAD
import { env } from "./env";

export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
=======

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
);