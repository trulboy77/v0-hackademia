-- Admin Dashboard Security Setup
-- This script sets up additional security features for the admin dashboard

-- Create admin-specific RLS policies
CREATE POLICY "Admin can manage all challenges" ON challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all users" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function for challenge creation with proper flag hashing
CREATE OR REPLACE FUNCTION create_challenge_admin(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_difficulty TEXT,
  p_points INTEGER,
  p_flag TEXT,
  p_hints TEXT[],
  p_is_active BOOLEAN,
  p_created_by UUID
) RETURNS challenges AS $$
DECLARE
  new_challenge challenges;
BEGIN
  -- Hash the flag using the existing hash_flag function
  INSERT INTO challenges (
    title,
    description,
    category,
    difficulty,
    points,
    flag_hash,
    hints,
    files,
    is_active,
    created_by
  ) VALUES (
    p_title,
    p_description,
    p_category,
    p_difficulty::difficulty_level,
    p_points,
    hash_flag(p_flag),
    p_hints,
    '{}',
    p_is_active,
    p_created_by
  ) RETURNING * INTO new_challenge;
  
  RETURN new_challenge;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create rate limiting table for security monitoring
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL,
  ip_address INET,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);

-- Enable RLS on new tables
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin can view rate limits" ON rate_limits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can view security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO security_events (
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_details,
    p_severity
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
