import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...mediaFiles, ...files].slice(0, 4);
    setMediaFiles(newFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setMediaPreviews(newPreviews);
  };

  const removeMedia = (index: number) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setLoading(true);
    const { error } = await createPost(
      content,
      isPublic,
      isPPV,
      isPPV ? parseFloat(ppvPrice) : undefined,
      mediaFiles
    );

    if (!error) {
      setContent('');
      setIsPublic(false);
      setIsPPV(false);
      setPpvPrice('');
      setMediaFiles([]);
      setMediaPreviews([]);
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display">Create Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />

          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {mediaFiles[index]?.type.startsWith('video/') ? (
                    <video src={preview} className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaFiles.length >= 4}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={mediaFiles.length >= 4}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public">Free Preview</Label>
                <p className="text-xs text-muted-foreground">Visible to everyone</p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={(checked) => {
                  setIsPublic(checked);
                  if (checked) setIsPPV(false);
                }}
              />
            </div>

            {!isPublic && (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ppv">Pay-Per-View</Label>
                  <p className="text-xs text-muted-foreground">One-time purchase</p>
                </div>
                <Switch
                  id="ppv"
                  checked={isPPV}
                  onCheckedChange={setIsPPV}
                />
              </div>
            )}

            {isPPV && (
              <div>
                <Label htmlFor="ppv-price">PPV Price ($)</Label>
                <Input
                  id="ppv-price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={ppvPrice}
                  onChange={(e) => setPpvPrice(e.target.value)}
                  placeholder="5.00"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary"
            disabled={loading || (!content.trim() && mediaFiles.length === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}