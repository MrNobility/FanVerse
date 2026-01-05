import { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { profile, isCreator } = useAuth();
  const { updateProfile, uploadAvatar, uploadBanner, becomeCreator, updating } = useProfile();
  
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [subscriptionPrice, setSubscriptionPrice] = useState(profile?.subscription_price?.toString() || '9.99');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    await updateProfile({
      username,
      display_name: displayName,
      bio,
      subscription_price: parseFloat(subscriptionPrice),
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadBanner(file);
    }
  };

  const handleBecomeCreator = async () => {
    await becomeCreator();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>

        {/* Profile Images */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Profile Images</CardTitle>
            <CardDescription>Update your avatar and banner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Banner */}
            <div>
              <Label>Banner</Label>
              <div 
                className="mt-2 h-32 rounded-lg bg-gradient-to-r from-primary to-accent relative overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
              >
                {profile?.banner_url && (
                  <img 
                    src={profile.banner_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-8 w-8" />
                </div>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>

            {/* Avatar */}
            <div>
              <Label>Avatar</Label>
              <div 
                className="mt-2 relative w-24 h-24 cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">
                    {profile?.display_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Profile Information</CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            {isCreator && (
              <div>
                <Label htmlFor="price">Subscription Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="4.99"
                  max="49.99"
                  step="0.01"
                  value={subscriptionPrice}
                  onChange={(e) => setSubscriptionPrice(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Min: $4.99, Max: $49.99
                </p>
              </div>
            )}

            <Button 
              onClick={handleSaveProfile} 
              className="gradient-primary"
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Become a Creator */}
        {!isCreator && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Become a Creator
              </CardTitle>
              <CardDescription>
                Start earning money by sharing exclusive content with your fans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Set your own subscription price
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Create exclusive posts and PPV content
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Receive tips from your fans
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Access your earnings dashboard
                </li>
              </ul>
              <Button onClick={handleBecomeCreator} className="gradient-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Creating
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}