import { MainLayout } from '@/components/layout/MainLayout';
import { PostCard } from '@/components/posts/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';

export default function Feed() {
  const { posts, loading, deletePost } = usePosts();

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Home</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-semibold mb-2">No posts yet</p>
            <p className="text-sm">Follow some creators to see their posts here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                onDelete={deletePost}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}