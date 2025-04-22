/*
  # Create scenarios table

  1. New Tables
    - `scenarios`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `location` (text)
      - `triggers` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their scenarios
*/

CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  title TEXT,
  time TEXT,
  location TEXT,
  participant TEXT,
  child_behavior TEXT,
  trigger_event TEXT,
  parent_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own scenarios"
  ON scenarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = scenarios.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scenarios"
  ON scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = scenarios.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own scenarios"
  ON scenarios
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = scenarios.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = scenarios.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX scenarios_profile_id_idx ON scenarios(profile_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();