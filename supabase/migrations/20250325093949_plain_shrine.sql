/*
  # Update profiles table schema

  1. Changes
    - Add new columns to profiles table:
      - `gender` (text): Store the child's gender
      - `diagnosis_age` (integer): Age when first diagnosed
      - `diagnosis_source` (text): Source of diagnosis
      - `severity` (text): Severity level of autism

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diagnosis_age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS diagnosis_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS severity TEXT;

-- Add unique constraint to ensure one profile per user
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);