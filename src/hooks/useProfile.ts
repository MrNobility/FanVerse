import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (updates: {
    username?: string;
    display_name?: string;
    bio?: string;
    subscription_price?: number;
  }) => {
    if (!profile) return { error: new Error('No profile found') };
    
    setUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);
    
    if (error) {
      toast.error('Failed to update profile');
      setUpdating(false);
      return { error };
    }
    
    await refreshProfile();
    toast.success('Profile updated successfully');
    setUpdating(false);
    return { error: null };
  };

  const uploadAvatar = async (file: File) => {
    if (!profile) return { error: new Error('No profile found'), url: null };
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.user_id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error('Failed to upload avatar');
      return { error: uploadError, url: null };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', profile.id);
    
    await refreshProfile();
    toast.success('Avatar updated');
    return { error: null, url: publicUrl };
  };

  const uploadBanner = async (file: File) => {
    if (!profile) return { error: new Error('No profile found'), url: null };
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.user_id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(filePath, file);
    
    if (uploadError) {
      toast.error('Failed to upload banner');
      return { error: uploadError, url: null };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('banners')
      .getPublicUrl(filePath);
    
    await supabase
      .from('profiles')
      .update({ banner_url: publicUrl })
      .eq('id', profile.id);
    
    await refreshProfile();
    toast.success('Banner updated');
    return { error: null, url: publicUrl };
  };

  const becomeCreator = async () => {
    if (!profile) return { error: new Error('No profile found') };
    
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: profile.user_id, role: 'creator' });
    
    if (error) {
      if (error.code === '23505') {
        toast.info('You are already a creator');
        return { error: null };
      }
      toast.error('Failed to become a creator');
      return { error };
    }
    
    await refreshProfile();
    toast.success('Welcome! You are now a creator');
    return { error: null };
  };

  return {
    profile,
    updating,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    becomeCreator
  };
}