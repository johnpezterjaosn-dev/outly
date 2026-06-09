import { createClient } from '@supabase/supabase-js'

// Keys hardcoded as fallback so app works without .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kyjyrzjfntilplenbimc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5anlyempmbnRpbHBsZW5iaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTMyNjYsImV4cCI6MjA5NTM2OTI2Nn0.N8DzRmfBfyTaT8_Ju_pdvDXwqJgyw8cc6QGcZxyy9R4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
