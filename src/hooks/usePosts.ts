import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Post, PostMedia } from '@/types/database';
import { toast } from 'sonner';

export function usePosts(creatorId?: string) {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        creator:profiles!posts_creator_id_fkey(*),
        post_media(*)
      `)
      .order('created_at', { ascending: false });
    
    if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts((data || []) as Post[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [creatorId]);

  const createPost = async (content: string, isPublic: boolean, isPPV: boolean, ppvPrice?: number, mediaFiles?: File[]) => {
    if (!profile) return { error: new Error('Not authenticated') };
    
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        creator_id: profile.id,
        content,
        is_public: isPublic,
        is_ppv: isPPV,
        ppv_price: isPPV ? ppvPrice : null
      })
      .select()
      .single();
    
    if (postError) {
      toast.error('Failed to create post');
      return { error: postError };
    }
    
    if (mediaFiles && mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${profile.user_id}/${post.id}/${Date.now()}.${fileExt}`;
        
        await supabase.storage
          .from('posts')
          .upload(filePath, file);
        
        const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
        
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        await supabase
          .from('post_media')
          .insert({
            post_id: post.id,
            media_type: mediaType,
            media_url: publicUrl
          });
      }
    }
    
    await fetchPosts();
    toast.success('Post created successfully');
    return { error: null };
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to delete post');
      return { error };
    }
    
    await fetchPosts();
    toast.success('Post deleted');
    return { error: null };
  };

  return {
    posts,
    loading,
    createPost,
    deletePost,
    refreshPosts: fetchPosts
  };
}