-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create desktop_apps table
CREATE TABLE IF NOT EXISTS public.desktop_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    position_x INTEGER DEFAULT 50,
    position_y INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create windows table
CREATE TABLE IF NOT EXISTS public.windows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    app_id UUID REFERENCES public.desktop_apps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    position_x INTEGER DEFAULT 100,
    position_y INTEGER DEFAULT 100,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    is_minimized BOOLEAN DEFAULT false,
    is_maximized BOOLEAN DEFAULT false,
    z_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desktop_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.windows ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for desktop_apps
CREATE POLICY "Users can view own apps" ON public.desktop_apps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own apps" ON public.desktop_apps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own apps" ON public.desktop_apps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own apps" ON public.desktop_apps
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for windows
CREATE POLICY "Users can view own windows" ON public.windows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own windows" ON public.windows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own windows" ON public.windows
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own windows" ON public.windows
    FOR DELETE USING (auth.uid() = user_id);
