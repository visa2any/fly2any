-- Create chat_transcripts table for Tawk.to integration
CREATE TABLE IF NOT EXISTS chat_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  chat_id TEXT NOT NULL UNIQUE,
  visitor_name TEXT,
  visitor_email TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_user_id ON chat_transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_chat_id ON chat_transcripts(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_transcripts_created_at ON chat_transcripts(created_at DESC);

-- Add foreign key if users table exists
-- ALTER TABLE chat_transcripts 
-- ADD CONSTRAINT fk_chat_transcripts_user_id 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE chat_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own chat transcripts
CREATE POLICY "Users can view own chat transcripts"
ON chat_transcripts
FOR SELECT
USING (auth.uid()::text = user_id);

-- Create policy: Service role can insert (for webhook)
CREATE POLICY "Service role can insert chat transcripts"
ON chat_transcripts
FOR INSERT
WITH CHECK (true);

COMMENT ON TABLE chat_transcripts IS 'Stores chat transcripts from Tawk.to support conversations';
