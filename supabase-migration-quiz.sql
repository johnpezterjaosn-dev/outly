-- Run this in Supabase > SQL Editor
-- Adds the new onboarding quiz fields to profiles

alter table public.profiles
  add column if not exists allergies text[] default '{}',
  add column if not exists postcode text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists first_tab text default 'dine';
