-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER handle_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_challenges
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_writeups
    BEFORE UPDATE ON public.writeups
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_courses
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_forum_threads
    BEFORE UPDATE ON public.forum_threads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_forum_posts
    BEFORE UPDATE ON public.forum_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to hash challenge flags
CREATE OR REPLACE FUNCTION public.hash_flag(flag_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(flag_text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to verify challenge flag
CREATE OR REPLACE FUNCTION public.verify_flag(challenge_id UUID, submitted_flag TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
    submitted_hash TEXT;
BEGIN
    -- Get the stored hash for the challenge
    SELECT flag_hash INTO stored_hash 
    FROM public.challenges 
    WHERE id = challenge_id AND is_active = true;
    
    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;
    
    -- Hash the submitted flag
    submitted_hash := encode(digest(submitted_flag, 'sha256'), 'hex');
    
    -- Compare hashes
    RETURN stored_hash = submitted_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a solve
CREATE OR REPLACE FUNCTION public.submit_solve(challenge_id UUID, submitted_flag TEXT)
RETURNS JSONB AS $$
DECLARE
    user_id UUID;
    challenge_points INTEGER;
    is_correct BOOLEAN;
    already_solved BOOLEAN;
BEGIN
    -- Get current user
    user_id := auth.uid();
    
    IF user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;
    
    -- Check if already solved
    SELECT EXISTS(
        SELECT 1 FROM public.solves 
        WHERE user_id = submit_solve.user_id AND challenge_id = submit_solve.challenge_id
    ) INTO already_solved;
    
    IF already_solved THEN
        RETURN jsonb_build_object('success', false, 'message', 'Challenge already solved');
    END IF;
    
    -- Verify the flag
    SELECT public.verify_flag(challenge_id, submitted_flag) INTO is_correct;
    
    IF NOT is_correct THEN
        RETURN jsonb_build_object('success', false, 'message', 'Incorrect flag');
    END IF;
    
    -- Get challenge points
    SELECT points INTO challenge_points 
    FROM public.challenges 
    WHERE id = challenge_id;
    
    -- Insert solve record
    INSERT INTO public.solves (user_id, challenge_id) 
    VALUES (user_id, challenge_id);
    
    -- Update user rating
    UPDATE public.users 
    SET rating = rating + challenge_points 
    WHERE id = user_id;
    
    -- Create notification
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        user_id,
        'solve',
        'Challenge Solved!',
        'Congratulations! You solved a challenge and earned ' || challenge_points || ' points.',
        jsonb_build_object('challenge_id', challenge_id, 'points', challenge_points)
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Challenge solved successfully!',
        'points_earned', challenge_points
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
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
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (target_user_id, notification_type, notification_title, notification_message, notification_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
