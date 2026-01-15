import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check,
    Star,
    Sparkle,
    X,
    Infinity,
    CircleNotch,
    Crown,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
import { triggerCelebration } from '@/lib/confetti';
import { updateUserPlan } from '@/lib/firebase';

interface PricingTier {
    id: 'free' | 'pro' | 'unlimited';
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    notIncluded?: string[];
    popular?: boolean;
    icon: React.ReactNode;
    buttonText: string;
    productId?: string;
}

const PRICING_TIERS: PricingTier[] = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Try it out',
        icon: <Sparkle size={24} weight="fill" />,
        features: [
            '1 lead magnet',
            'PDF export',
            'Basic templates',
        ],
        notIncluded: [
            'Limited export formats',
        ],
        buttonText: 'Current Plan',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$9.99',
        period: '/month',
        description: 'For creators',
        icon: <Star size={24} weight="fill" />,
        popular: true,
        features: [
            '10 lead magnets',
            'PDF & PNG export',
            'Longer lead magnets (up to 3k words)',
            'All templates',
            'Priority support',
        ],
        buttonText: 'Start Pro',
        productId: 'com.leadmagnet.ai.pro.monthly',
    },
    {
        id: 'unlimited',
        name: 'Unlimited',
        price: '$29.99',
        period: 'one-time',
        description: 'Best value',
        icon: <Infinity size={24} weight="bold" />,
        features: [
            'Unlimited lead magnets',
            'All export formats',
            'Longer lead magnets (up to 3k words)',
            'All templates',
            'Priority generation',
            'Lifetime access',
        ],
        buttonText: 'Get Lifetime',
        productId: 'com.leadmagnet.ai.unlimited',
    },
];

interface PaywallPageProps {
    onClose?: () => void;
    trigger?: 'limit' | 'export' | 'template' | 'manual';
}

export function PaywallPage({ onClose, trigger = 'manual' }: PaywallPageProps) {
    const navigate = useNavigate();
    const { user, userProfile, refreshProfile } = useAuth();
    const {
        isSupported,
        proPackage,
        unlimitedPackage,
        purchase,
        restore,
    } = useRevenueCat();
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [purchaseSuccess, setPurchaseSuccess] = useState<{ plan: string; name: string } | null>(null);

    const currentPlan = userProfile?.plan || 'free';

    const getTriggerMessage = () => {
        switch (trigger) {
            case 'limit':
                return "You've reached your free limit! Upgrade to create more lead magnets.";
            case 'export':
                return 'This export format requires an upgrade.';
            case 'template':
                return 'Premium templates require an upgrade.';
            default:
                return 'Unlock the full power of LeadMagnet AI';
        }
    };

    const handlePurchase = async (tier: PricingTier) => {
        triggerImpactHaptic('medium');

        if (tier.id === 'free') {
            onClose?.();
            return;
        }

        // Check if RevenueCat is supported (native iOS only)
        if (!isSupported) {
            triggerNotificationHaptic('warning');
            alert('In-app purchases are only available in the iOS app.');
            return;
        }

        // Get the appropriate package
        const pkg = tier.id === 'pro' ? proPackage : unlimitedPackage;

        if (!pkg) {
            triggerNotificationHaptic('error');
            alert('Unable to load products. Please try again later.');
            return;
        }

        try {
            setPurchasing(tier.id);
            const success = await purchase(pkg);

            if (success && user) {
                // Update user's plan in Firestore
                await updateUserPlan(user.uid, tier.id);

                // Refresh the user profile to update UI immediately
                await refreshProfile();

                // Show success state with celebration
                triggerNotificationHaptic('success');
                triggerCelebration();
                setPurchaseSuccess({ plan: tier.id, name: tier.name });

                // Auto-close after showing success
                setTimeout(() => {
                    onClose?.() || navigate('/dashboard');
                }, 2500);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            triggerNotificationHaptic('error');
            alert('Purchase failed. Please try again.');
        } finally {
            setPurchasing(null);
        }
    };

    const handleRestore = async () => {
        triggerImpactHaptic('light');

        if (!isSupported) {
            // Mock restore for web dev
            if (user) {
                await updateUserPlan(user.uid, 'pro');
                await refreshProfile();
                triggerNotificationHaptic('success');
                triggerCelebration();
                setPurchaseSuccess({ plan: 'pro', name: 'Pro' });
                setTimeout(() => {
                    onClose?.() || navigate('/dashboard');
                }, 2500);
                return;
            }
            alert('Restore purchases is only available in the iOS app.');
            return;
        }

        try {
            setPurchasing('restore');
            const success = await restore();

            if (success) {
                await refreshProfile();
                triggerNotificationHaptic('success');
                triggerCelebration();
                setPurchaseSuccess({ plan: 'pro', name: 'Pro' });
                setTimeout(() => {
                    onClose?.() || navigate('/dashboard');
                }, 2500);
            } else {
                triggerNotificationHaptic('warning');
                alert('No previous purchases found.');
            }
        } catch (error) {
            console.error('Restore error:', error);
            triggerNotificationHaptic('error');
            alert('Failed to restore purchases. Please try again.');
        } finally {
            setPurchasing(null);
        }
    };

    // Success overlay after purchase
    if (purchaseSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl shadow-primary/30 animate-in zoom-in duration-700">
                        <Crown size={48} weight="fill" className="text-white" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Welcome to {purchaseSuccess.name}!
                        </h1>
                        <p className="text-muted-foreground">
                            Your account has been upgraded successfully
                        </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <CircleNotch size={16} className="animate-spin" />
                        <span>Redirecting you...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-4 px-4 sm:px-6 flex flex-col items-center">
            {/* Nav/Close */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-4">
                <button onClick={() => onClose?.() || navigate(-1)} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                    <X size={24} />
                </button>
                <Button variant="ghost" className="text-sm font-medium" onClick={handleRestore}>
                    Restore Purchases
                </Button>
            </div>

            <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    Upgrade to Professional
                </h1>
                <p className="text-base text-muted-foreground max-w-lg mx-auto">
                    {getTriggerMessage()}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 w-full max-w-5xl mb-6">
                {PRICING_TIERS.map((tier) => {
                    const isCurrent = currentPlan === tier.id;
                    const isPopular = tier.popular;

                    return (
                        <Card
                            key={tier.id}
                            className={`relative flex flex-col h-full transition-all duration-200 ${isPopular
                                ? 'border-primary shadow-lg scale-105 z-10'
                                : 'border-border hover:border-primary/50'
                                } ${isCurrent ? 'bg-secondary/50' : 'bg-card'}`}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold rounded-full shadow-md">
                                    MOST POPULAR
                                </div>
                            )}

                            <CardHeader className="pb-3 text-center">
                                <div className="mx-auto w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
                                    {tier.icon}
                                </div>
                                <CardTitle className="text-lg font-bold">{tier.name}</CardTitle>
                                <div className="flex items-baseline justify-center gap-1 mt-1">
                                    <span className="text-3xl font-bold">{tier.price}</span>
                                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col pt-0">
                                <ul className="space-y-2 mb-6 flex-1">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <Check size={14} className="text-green-500 mt-0.5 shrink-0" weight="bold" />
                                            <span className="text-muted-foreground text-xs">{feature}</span>
                                        </li>
                                    ))}
                                    {tier.notIncluded?.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm opacity-50">
                                            <X size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                                            <span className="text-muted-foreground text-xs">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    size="default"
                                    variant={isPopular ? 'gradient' : 'outline'}
                                    className="w-full"
                                    disabled={isCurrent || purchasing !== null}
                                    onClick={() => handlePurchase(tier)}
                                >
                                    {purchasing === tier.id ? (
                                        <CircleNotch size={18} className="animate-spin mr-2" />
                                    ) : (
                                        isCurrent ? 'Current Plan' : tier.buttonText
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
                Secure payment via Apple App Store. Cancel anytime in your subscription settings.
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
}
