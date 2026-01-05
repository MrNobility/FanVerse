import { MainLayout } from '@/components/layout/MainLayout';
import { CreatePostForm } from '@/components/posts/CreatePostForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function CreatePost() {
  const navigate = useNavigate();
  const { isCreator } = useAuth();

  if (!isCreator) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-display font-bold mb-4">Become a Creator</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a creator to post content
          </p>
          <Button className="gradient-primary" onClick={() => navigate('/settings')}>
            Become a Creator
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <CreatePostForm onSuccess={() => navigate('/feed')} />
    </MainLayout>
  );
}