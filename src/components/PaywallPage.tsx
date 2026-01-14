import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Crown,
    Check,
    Lightning,
    Star,
    Sparkle,
    X,
    Infinity,
    CircleNotch,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';
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
            'Watermark on exports',
            'No custom branding',
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
            'No watermark',
            'All templates',
            'Custom branding',
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
            'No watermark',
            'All templates',
            'Custom branding',
            'White-label option',
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
    const { user, userProfile } = useAuth();
    const {
        isSupported,
        proPackage,
        unlimitedPackage,
        purchase,
        restore,
        isLoading: rcLoading
    } = useRevenueCat();
    const [purchasing, setPurchasing] = useState<string | null>(null);

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
                triggerNotificationHaptic('success');
                onClose?.();
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
            alert('Restore purchases is only available in the iOS app.');
            return;
        }

        try {
            setPurchasing('restore');
            const success = await restore();

            if (success) {
                triggerNotificationHaptic('success');
                alert('Purchases restored successfully!');
                onClose?.();
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mb-4"
                        onClick={onClose}
                    >
                        <X size={24} />
                    </Button>
                )}

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4"
                    >
                        <Crown size={32} weight="fill" className="text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {getTriggerMessage()}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {PRICING_TIERS.map((tier, index) => (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`relative h-full ${tier.popular
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : tier.id === currentPlan
                                        ? 'border-muted'
                                        : ''
                                    }`}
                            >
                                {tier.popular && (
                                    <Badge
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary"
                                    >
                                        Most Popular
                                    </Badge>
                                )}
                                {tier.id === 'unlimited' && (
                                    <Badge
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500"
                                    >
                                        Best Value
                                    </Badge>
                                )}

                                <CardHeader className="text-center pb-2">
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2 ${tier.id === 'unlimited'
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                                        : tier.id === 'pro'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {tier.icon}
                                    </div>
                                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold">{tier.price}</span>
                                        <span className="text-muted-foreground text-sm">{tier.period}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <ul className="space-y-2 mb-6">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-sm">
                                                <Check
                                                    size={16}
                                                    weight="bold"
                                                    className="text-green-500 mt-0.5 flex-shrink-0"
                                                />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {tier.notIncluded?.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <X
                                                    size={16}
                                                    weight="bold"
                                                    className="text-muted-foreground mt-0.5 flex-shrink-0"
                                                />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full ${tier.id === 'unlimited'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                                            : tier.popular
                                                ? ''
                                                : ''
                                            }`}
                                        variant={tier.id === currentPlan ? 'outline' : tier.popular ? 'default' : 'secondary'}
                                        disabled={tier.id === currentPlan || purchasing !== null || rcLoading}
                                        onClick={() => handlePurchase(tier)}
                                    >
                                        {purchasing === tier.id ? (
                                            <>
                                                <CircleNotch size={16} className="mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : tier.id === currentPlan ? (
                                            <>
                                                <Check size={16} className="mr-2" />
                                                Current Plan
                                            </>
                                        ) : (
                                            <>
                                                {tier.id === 'unlimited' && <Lightning size={16} weight="fill" className="mr-2" />}
                                                {tier.buttonText}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Features comparison */}
                <div className="bg-card rounded-xl p-6 mb-6">
                    <h3 className="font-semibold mb-4 text-center">Why Upgrade?</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div className="p-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Star size={20} weight="fill" className="text-primary" />
                            </div>
                            <h4 className="font-medium mb-1">More Lead Magnets</h4>
                            <p className="text-sm text-muted-foreground">
                                Create ebooks, checklists, guides & more
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Sparkle size={20} weight="fill" className="text-primary" />
                            </div>
                            <h4 className="font-medium mb-1">No Watermarks</h4>
                            <p className="text-sm text-muted-foreground">
                                Clean, professional exports
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <Crown size={20} weight="fill" className="text-primary" />
                            </div>
                            <h4 className="font-medium mb-1">Custom Branding</h4>
                            <p className="text-sm text-muted-foreground">
                                Your colors, logo, and style
                            </p>
                        </div>
                    </div>
                </div>

                {/* Restore purchases */}
                <div className="text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRestore}
                        disabled={purchasing !== null || rcLoading}
                        className="text-muted-foreground"
                    >
                        {purchasing === 'restore' ? (
                            <>
                                <CircleNotch size={16} className="mr-2 animate-spin" />
                                Restoring...
                            </>
                        ) : (
                            'Restore Purchases'
                        )}
                    </Button>
                </div>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground mt-4 max-w-md mx-auto">
                    By purchasing, you agree to our{' '}
                    <button
                        className="underline hover:text-foreground"
                        onClick={() => navigate('/terms')}
                    >
                        Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                        className="underline hover:text-foreground"
                        onClick={() => navigate('/privacy')}
                    >
                        Privacy Policy
                    </button>
                    . Subscriptions auto-renew unless cancelled.
                </p>
            </div>
        </div>
    );
}
