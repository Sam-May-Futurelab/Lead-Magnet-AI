import { useState } from 'react';
import { GoogleLogo, AppleLogo, Sparkle, Lightning } from '@phosphor-icons/react';
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Google sign-in failed:', err);
            setError(err instanceof Error ? err.message : 'Sign in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithApple();
        } catch (err) {
            console.error('Apple sign-in failed:', err);
            setError(err instanceof Error ? err.message : 'Sign in failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
            {/* Header area with branding */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-safe-top">
                {/* Logo/Icon */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Sparkle className="w-12 h-12 text-white" weight="fill" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                        <Lightning className="w-4 h-4 text-secondary-foreground" weight="fill" />
                    </div>
                </div>

                {/* App name and tagline */}
                <h1 className="text-3xl font-bold text-foreground mb-2">Lead Magnet AI</h1>
                <p className="text-muted-foreground text-center max-w-xs mb-8">
                    Create stunning lead magnets in seconds with the power of AI
                </p>

                {/* Features preview */}
                <div className="flex gap-6 mb-12">
                    {[
                        { label: 'AI-Powered', icon: '✨' },
                        { label: 'Export PDF', icon: '📄' },
                        { label: 'Free Tier', icon: '🎁' },
                    ].map((feature) => (
                        <div key={feature.label} className="flex flex-col items-center gap-1">
                            <span className="text-2xl">{feature.icon}</span>
                            <span className="text-xs text-muted-foreground">{feature.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sign in buttons */}
            <div className="px-6 pb-safe-bottom space-y-3 mb-8">
                {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={cn(
                        'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl',
                        'bg-white text-gray-800 font-medium',
                        'border border-gray-200 shadow-sm',
                        'active:scale-[0.98] transition-transform',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <GoogleLogo className="w-5 h-5" weight="bold" />
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <button
                    onClick={handleAppleSignIn}
                    disabled={isLoading}
                    className={cn(
                        'w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl',
                        'bg-black text-white font-medium',
                        'shadow-sm',
                        'active:scale-[0.98] transition-transform',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    <AppleLogo className="w-5 h-5" weight="fill" />
                    {isLoading ? 'Signing in...' : 'Continue with Apple'}
                </button>

                <p className="text-xs text-muted-foreground text-center pt-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
