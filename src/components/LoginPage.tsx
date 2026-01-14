import { useState } from 'react';
import { GoogleLogo, AppleLogo, Lightning, Sparkle, FilePdf, Gift } from '@phosphor-icons/react';
import { signInWithGoogle, signInWithApple } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] opacity-50" />

            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Header area with branding */}
                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Logo/Icon */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/20 ring-4 ring-background">
                            <img src="/app-icon.png" alt="Lead Magnet AI" className="w-14 h-14 object-contain" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-md">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                <Lightning className="w-5 h-5 text-secondary-foreground" weight="fill" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Lead Magnet AI</h1>
                        <p className="text-muted-foreground text-lg max-w-[280px] mx-auto leading-relaxed">
                            Create stunning lead magnets in seconds with AI
                        </p>
                    </div>

                    {/* Features preview */}
                    <div className="grid grid-cols-3 gap-4 w-full pt-4">
                        {[
                            { label: 'AI-Powered', Icon: Sparkle, color: 'text-amber-500' },
                            { label: 'Export PDF', Icon: FilePdf, color: 'text-red-500' },
                            { label: 'Free Tier', Icon: Gift, color: 'text-emerald-500' },
                        ].map(({ label, Icon, color }) => (
                            <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border shadow-sm">
                                <Icon className={cn("w-6 h-6", color)} weight="duotone" />
                                <span className="text-xs font-medium text-foreground">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sign in buttons */}
                <div className="space-y-4 pt-4">
                    {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                            <p className="text-sm font-medium text-destructive text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full h-14 text-base font-medium gap-3 bg-background hover:bg-muted/50 border-input relative overflow-hidden group"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <GoogleLogo className="w-6 h-6" weight="bold" />
                        <span>Continue with Google</span>
                    </Button>

                    <Button
                        variant="default"
                        size="lg"
                        className="w-full h-14 text-base font-medium gap-3 bg-foreground text-background hover:bg-foreground/90 relative overflow-hidden"
                        onClick={handleAppleSignIn}
                        disabled={isLoading}
                    >
                        <AppleLogo className="w-6 h-6" weight="fill" />
                        <span>Continue with Apple</span>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground px-6 mt-6">
                        By continuing, you agree to our{' '}
                        <a href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
