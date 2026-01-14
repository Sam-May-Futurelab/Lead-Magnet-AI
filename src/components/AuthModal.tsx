import { useState } from 'react';
import { GoogleLogo, AppleLogo } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';
import { triggerImpactHaptic } from '@/lib/haptics';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    triggerImpactHaptic('light');

    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    triggerImpactHaptic('light');

    try {
      await signInWithApple();
      onOpenChange(false);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <img src="/app-icon.png" alt="Lead Magnet AI" className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl">Welcome to Lead Magnet AI</DialogTitle>
          <DialogDescription className="text-base">
            Sign in to create and save your lead magnets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            variant="outline"
            className="w-full h-12 text-base gap-3"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleLogo size={20} weight="bold" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-base gap-3"
            onClick={handleAppleSignIn}
            disabled={isLoading}
          >
            <AppleLogo size={20} weight="fill" />
            Continue with Apple
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}
