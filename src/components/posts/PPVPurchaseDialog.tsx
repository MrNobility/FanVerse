import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, CreditCard, Check, Loader2, ShieldCheck } from 'lucide-react';
import { Profile } from '@/types/database';

interface PPVPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  price: number;
  creator: Profile | undefined;
  onPurchase: () => Promise<void>;
  purchasing: boolean;
}

export function PPVPurchaseDialog({
  open,
  onOpenChange,
  price,
  creator,
  onPurchase,
  purchasing
}: PPVPurchaseDialogProps) {
  const [step, setStep] = useState<'confirm' | 'success'>('confirm');

  const handlePurchase = async () => {
    await onPurchase();
    setStep('success');
    setTimeout(() => {
      onOpenChange(false);
      setStep('confirm');
    }, 1500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('confirm');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'confirm' ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <DialogTitle className="text-xl font-display">Unlock This Content</DialogTitle>
              <DialogDescription>
                Pay once to unlock this exclusive content forever
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Creator info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={creator?.avatar_url || undefined} />
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    {creator?.display_name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{creator?.display_name || creator?.username}</p>
                  <p className="text-sm text-muted-foreground">@{creator?.username}</p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Content price</span>
                  <span className="font-semibold">${price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">${price.toFixed(2)}</span>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure payment. One-time purchase, lifetime access.</span>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                onClick={handlePurchase} 
                className="w-full gradient-primary"
                disabled={purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ${price.toFixed(2)}
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleClose}
                disabled={purchasing}
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="text-xl font-display mb-2">Content Unlocked!</DialogTitle>
            <DialogDescription>
              You now have lifetime access to this content
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
