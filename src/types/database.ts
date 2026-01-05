export type AppRole = 'admin' | 'creator' | 'fan';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  date_of_birth: string | null;
  is_age_verified: boolean;
  is_creator_verified: boolean;
  subscription_price: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  creator_id: string;
  content: string | null;
  is_public: boolean;
  is_ppv: boolean;
  ppv_price: number | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  post_media?: PostMedia[];
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  fan_id: string;
  creator_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'expired';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  fan?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message_at: string;
  created_at: string;
  participant_1?: Profile;
  participant_2?: Profile;
  messages?: Message[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_post' | 'new_message' | 'new_subscription' | 'tip_received' | 'ppv_purchased';
  title: string;
  message: string | null;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface Tip {
  id: string;
  fan_id: string;
  creator_id: string;
  amount: number;
  message: string | null;
  stripe_payment_id: string | null;
  created_at: string;
  fan?: Profile;
}

export interface Transaction {
  id: string;
  creator_id: string;
  fan_id: string | null;
  type: 'subscription' | 'tip' | 'ppv';
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  stripe_payment_id: string | null;
  created_at: string;
  fan?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_post_id: string | null;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  reported_user?: Profile;
}

export interface PlatformSettings {
  id: string;
  platform_fee_percentage: number;
  min_subscription_price: number;
  max_subscription_price: number;
  updated_at: string;
}