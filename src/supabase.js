import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://keqfnswtarzjzkacvefp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcWZuc3d0YXJ6anprYWN2ZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDY5OTAsImV4cCI6MjEwNTY4Mjk5MH0.Gb5vBhP493SQa094P5k8m6JkpKue2EFcFEWvCaDpflY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
