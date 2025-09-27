-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for users table
-- Users can view all users (for leaderboards, etc.)
CREATE POLICY "Anyone can view users" ON public.users
    FOR SELECT USING (true);

-- Users can update their own profile, admins can update any
CREATE POLICY "Users can update own profile or admin can update any" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR 
        public.is_admin(auth.uid())
    );

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for challenges table
-- Anyone can view active challenges
CREATE POLICY "Anyone can view active challenges" ON public.challenges
    FOR SELECT USING (is_active = true);

-- Only admins can insert, update, or delete challenges
CREATE POLICY "Only admins can manage challenges" ON public.challenges
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for solves table
-- Users can insert their own solves
CREATE POLICY "Users can insert own solves" ON public.solves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can view all solves (for leaderboards)
CREATE POLICY "Anyone can view solves" ON public.solves
    FOR SELECT USING (true);

-- RLS Policies for writeups table
-- Anyone can view published writeups
CREATE POLICY "Anyone can view published writeups" ON public.writeups
    FOR SELECT USING (is_published = true OR auth.uid() = user_id);

-- Users can insert their own writeups
CREATE POLICY "Users can insert own writeups" ON public.writeups
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own writeups, admins can manage any
CREATE POLICY "Users can manage own writeups or admin can manage any" ON public.writeups
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        public.is_admin(auth.uid())
    );

CREATE POLICY "Users can delete own writeups or admin can delete any" ON public.writeups
    FOR DELETE USING (
        auth.uid() = user_id OR 
        public.is_admin(auth.uid())
    );

-- RLS Policies for courses table
-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses" ON public.courses
    FOR SELECT USING (is_published = true);

-- Only admins can manage courses
CREATE POLICY "Only admins can manage courses" ON public.courses
    FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for forum_threads table
-- Anyone can view forum threads
CREATE POLICY "Anyone can view forum threads" ON public.forum_threads
    FOR SELECT USING (true);

-- Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads" ON public.forum_threads
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Thread creators and admins can update threads
CREATE POLICY "Thread creators and admins can update threads" ON public.forum_threads
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        public.is_admin(auth.uid())
    );

-- Only admins can delete threads
CREATE POLICY "Only admins can delete threads" ON public.forum_threads
    FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS Policies for forum_posts table
-- Anyone can view forum posts
CREATE POLICY "Anyone can view forum posts" ON public.forum_posts
    FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Post creators and admins can update posts
CREATE POLICY "Post creators and admins can update posts" ON public.forum_posts
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        public.is_admin(auth.uid())
    );

-- Post creators and admins can delete posts
CREATE POLICY "Post creators and admins can delete posts" ON public.forum_posts
    FOR DELETE USING (
        auth.uid() = created_by OR 
        public.is_admin(auth.uid())
    );

-- RLS Policies for messages table
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Recipients can update messages" ON public.messages
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Users can delete messages they sent or received
CREATE POLICY "Users can delete own messages" ON public.messages
    FOR DELETE USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- RLS Policies for notifications table
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- System can insert notifications (handled by functions)
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);
