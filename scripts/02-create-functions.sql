-- Function to hash flags
CREATE OR REPLACE FUNCTION hash_flag(flag_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(flag_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to verify flags
CREATE OR REPLACE FUNCTION verify_flag(challenge_id UUID, submitted_flag TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT flag_hash INTO stored_hash FROM challenges WHERE id = challenge_id;
  RETURN stored_hash = hash_flag(submitted_flag);
END;
$$ LANGUAGE plpgsql;

-- Function to submit a solve
CREATE OR REPLACE FUNCTION submit_solve(challenge_id UUID, submitted_flag TEXT)
RETURNS JSONB AS $$
DECLARE
  user_id UUID;
  challenge_points INTEGER;
  is_correct BOOLEAN;
  already_solved BOOLEAN;
BEGIN
  -- Get current user ID (this would be set by your auth system)
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if already solved
  SELECT EXISTS(SELECT 1 FROM solves WHERE user_id = submit_solve.user_id AND challenge_id = submit_solve.challenge_id) INTO already_solved;
  
  IF already_solved THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge already solved');
  END IF;
  
  -- Verify the flag
  SELECT verify_flag(submit_solve.challenge_id, submitted_flag) INTO is_correct;
  
  IF NOT is_correct THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect flag');
  END IF;
  
  -- Get challenge points
  SELECT points INTO challenge_points FROM challenges WHERE id = submit_solve.challenge_id;
  
  -- Insert solve record
  INSERT INTO solves (user_id, challenge_id) VALUES (user_id, submit_solve.challenge_id);
  
  -- Update user rating
  UPDATE users SET rating = rating + challenge_points WHERE id = user_id;
  
  -- Create notification
  PERFORM create_notification(
    user_id,
    'solve',
    'Challenge Solved!',
    'You successfully solved a challenge and earned ' || challenge_points || ' points.',
    jsonb_build_object('challenge_id', submit_solve.challenge_id, 'points', challenge_points)
  );
  
  RETURN jsonb_build_object('success', true, 'points', challenge_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = is_admin.user_id;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql;

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET rating = rating + points_to_add WHERE id = update_user_rating.user_id;
END;
$$ LANGUAGE plpgsql;
