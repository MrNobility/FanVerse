-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'creator', 'fan');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'fan',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    date_of_birth DATE,
    is_age_verified BOOLEAN DEFAULT false,
    is_creator_verified BOOLEAN DEFAULT false,
    subscription_price DECIMAL(10, 2) DEFAULT 9.99,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    is_public BOOLEAN DEFAULT false,
    is_ppv BOOLEAN DEFAULT false,
    ppv_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_media table
CREATE TABLE public.post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (fan_id, creator_id)
);

-- Create ppv_purchases table
CREATE TABLE public.ppv_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (fan_id, post_id)
);

-- Create tips table
CREATE TABLE public.tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    participant_2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (participant_1_id, participant_2_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_post', 'new_message', 'new_subscription', 'tip_received', 'ppv_purchased')),
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_settings table
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
    min_subscription_price DECIMAL(10, 2) DEFAULT 4.99,
    max_subscription_price DECIMAL(10, 2) DEFAULT 49.99,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for earnings tracking
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fan_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'tip', 'ppv')),
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    net_amount DECIMAL(10, 2) NOT NULL,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (platform_fee_percentage) VALUES (20.00);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppv_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for posts
CREATE POLICY "Public posts are viewable by everyone" ON public.posts
    FOR SELECT USING (is_public = true);

CREATE POLICY "Subscribers can view creator posts" ON public.posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE fan_id = public.get_current_profile_id() 
            AND creator_id = posts.creator_id 
            AND status = 'active'
        )
    );

CREATE POLICY "Creators can view their own posts" ON public.posts
    FOR SELECT USING (creator_id = public.get_current_profile_id());

CREATE POLICY "PPV purchasers can view purchased posts" ON public.posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ppv_purchases 
            WHERE fan_id = public.get_current_profile_id() 
            AND post_id = posts.id
        )
    );

CREATE POLICY "Creators can manage their own posts" ON public.posts
    FOR ALL USING (creator_id = public.get_current_profile_id());

-- RLS Policies for post_media
CREATE POLICY "Media viewable if post is viewable" ON public.post_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_media.post_id
        )
    );

CREATE POLICY "Creators can manage their post media" ON public.post_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = post_media.post_id 
            AND posts.creator_id = public.get_current_profile_id()
        )
    );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their subscriptions" ON public.subscriptions
    FOR SELECT USING (
        fan_id = public.get_current_profile_id() 
        OR creator_id = public.get_current_profile_id()
    );

CREATE POLICY "Fans can create subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (fan_id = public.get_current_profile_id());

-- RLS Policies for ppv_purchases
CREATE POLICY "Users can view their ppv purchases" ON public.ppv_purchases
    FOR SELECT USING (fan_id = public.get_current_profile_id());

CREATE POLICY "Creators can view ppv purchases of their posts" ON public.ppv_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts 
            WHERE posts.id = ppv_purchases.post_id 
            AND posts.creator_id = public.get_current_profile_id()
        )
    );

CREATE POLICY "Fans can create ppv purchases" ON public.ppv_purchases
    FOR INSERT WITH CHECK (fan_id = public.get_current_profile_id());

-- RLS Policies for tips
CREATE POLICY "Users can view their tips" ON public.tips
    FOR SELECT USING (
        fan_id = public.get_current_profile_id() 
        OR creator_id = public.get_current_profile_id()
    );

CREATE POLICY "Fans can create tips" ON public.tips
    FOR INSERT WITH CHECK (fan_id = public.get_current_profile_id());

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT USING (
        participant_1_id = public.get_current_profile_id() 
        OR participant_2_id = public.get_current_profile_id()
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        participant_1_id = public.get_current_profile_id() 
        OR participant_2_id = public.get_current_profile_id()
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                conversations.participant_1_id = public.get_current_profile_id() 
                OR conversations.participant_2_id = public.get_current_profile_id()
            )
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = public.get_current_profile_id() 
        AND EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE conversations.id = messages.conversation_id 
            AND (
                conversations.participant_1_id = public.get_current_profile_id() 
                OR conversations.participant_2_id = public.get_current_profile_id()
            )
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = public.get_current_profile_id());

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = public.get_current_profile_id());

CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (user_id = public.get_current_profile_id());

-- RLS Policies for reports
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (reporter_id = public.get_current_profile_id());

CREATE POLICY "Admins can view all reports" ON public.reports
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" ON public.reports
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_settings
CREATE POLICY "Everyone can view platform settings" ON public.platform_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update platform settings" ON public.platform_settings
    FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transactions
CREATE POLICY "Creators can view their transactions" ON public.transactions
    FOR SELECT USING (creator_id = public.get_current_profile_id());

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name'
  );
  
  -- Add default fan role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'fan');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', false);

-- Storage policies for avatars (public)
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for banners (public)
CREATE POLICY "Banner images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banner" ON storage.objects
    FOR UPDATE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banner" ON storage.objects
    FOR DELETE USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for posts (private, access controlled)
CREATE POLICY "Creators can manage their post media" ON storage.objects
    FOR ALL USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);