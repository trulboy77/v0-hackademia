-- Insert default desktop apps for demonstration
-- Note: This will be executed after user creation, so we'll create a function to seed apps for new users

CREATE OR REPLACE FUNCTION public.seed_default_apps_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.desktop_apps (user_id, name, icon, position_x, position_y) VALUES
    (user_id, 'Terminal', 'terminal', 50, 50),
    (user_id, 'File Manager', 'folder', 150, 50),
    (user_id, 'Code Editor', 'code', 250, 50),
    (user_id, 'Browser', 'globe', 350, 50),
    (user_id, 'Settings', 'settings', 50, 150),
    (user_id, 'Calculator', 'calculator', 150, 150),
    (user_id, 'Notes', 'file-text', 250, 150),
    (user_id, 'Music Player', 'music', 350, 150);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include default apps
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Seed default apps for the new user
    PERFORM public.seed_default_apps_for_user(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
