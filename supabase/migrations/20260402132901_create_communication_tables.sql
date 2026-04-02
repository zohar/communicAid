/*
  # Communication App Database Schema

  1. New Tables
    - `recent_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `item_text` (text) - The text that was tapped
      - `item_icon` (text) - The icon/emoji for the item
      - `tapped_at` (timestamptz) - When it was tapped
    
    - `quick_names`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - The name (e.g., "Nurse", "Mum")
      - `icon` (text) - The icon/emoji
      - `position` (integer) - Display order (1-6)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS recent_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  item_icon text DEFAULT '',
  tapped_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quick_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT '👤',
  position integer NOT NULL CHECK (position >= 1 AND position <= 6),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, position)
);

ALTER TABLE recent_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recent items"
  ON recent_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recent items"
  ON recent_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recent items"
  ON recent_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quick names"
  ON quick_names FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick names"
  ON quick_names FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick names"
  ON quick_names FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick names"
  ON quick_names FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recent_items_user_tapped 
  ON recent_items(user_id, tapped_at DESC);

CREATE INDEX IF NOT EXISTS idx_quick_names_user_position 
  ON quick_names(user_id, position);