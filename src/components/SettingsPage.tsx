import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User,
    Crown,
    Shield,
    FileText,
    SignOut,
    CaretRight,
    Envelope,
    Star,
    Trash,
    PaintBrush,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/firebase';
import { PLAN_LIMITS } from '@/lib/types';
import { triggerImpactHaptic, triggerNotificationHaptic } from '@/lib/haptics';

interface SettingItem {
    icon: React.ReactNode;
    label: string;
    description?: string;
    action: () => void;
    badge?: string;
    destructive?: boolean;
    external?: boolean;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const plan = userProfile?.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    const handleSignOut = async () => {
        triggerImpactHaptic('medium');
        try {
            await signOut();
            triggerNotificationHaptic('success');
            navigate('/');
        } catch (error) {
            console.error('Sign out error:', error);
            triggerNotificationHaptic('error');
        }
    };

    const handleDeleteAccount = async () => {
        triggerImpactHaptic('heavy');
        // TODO: Implement account deletion
        alert('Account deletion coming soon. Please contact support.');
        setShowDeleteDialog(false);
    };

    const openURL = (url: string) => {
        window.open(url, '_blank');
    };

    const sections: SettingSection[] = [
        {
            title: 'Account',
            items: [
                {
                    icon: <FileText size={22} className="text-primary" />,
                    label: 'My Lead Magnets',
                    description: 'View all your creations',
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/dashboard');
                    },
                },
                {
                    icon: <Crown size={22} weight="fill" className="text-amber-500" />,
                    label: 'Subscription',
                    description: plan === 'free' ? 'Free Plan' : plan === 'pro' ? 'Pro Plan' : 'Unlimited',
                    badge: plan !== 'free' ? 'Active' : undefined,
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/paywall');
                    },
                },
                {
                    icon: <PaintBrush size={22} />,
                    label: 'Default Style',
                    description: 'Colors and fonts',
                    action: () => {
                        triggerImpactHaptic('light');
                        // TODO: Navigate to style settings
                        alert('Style customization coming soon!');
                    },
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: <Envelope size={22} />,
                    label: 'Contact Support',
                    description: 'hello@inkfluenceai.com',
                    action: () => {
                        triggerImpactHaptic('light');
                        openURL('mailto:hello@inkfluenceai.com');
                    },
                    external: true,
                },
                {
                    icon: <Star size={22} className="text-amber-500" />,
                    label: 'Rate the App',
                    description: 'Help us improve',
                    action: () => {
                        triggerImpactHaptic('light');
                        // TODO: Implement App Store rating
                        openURL('https://apps.apple.com/app/id123456789');
                    },
                    external: true,
                },
            ],
        },
        {
            title: 'Legal',
            items: [
                {
                    icon: <Shield size={22} />,
                    label: 'Privacy Policy',
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/privacy');
                    },
                },
                {
                    icon: <FileText size={22} />,
                    label: 'Terms of Service',
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/terms');
                    },
                },
            ],
        },
        {
            title: 'Danger Zone',
            items: [
                {
                    icon: <SignOut size={22} />,
                    label: 'Sign Out',
                    action: () => {
                        triggerImpactHaptic('light');
                        setShowSignOutDialog(true);
                    },
                },
                {
                    icon: <Trash size={22} className="text-red-500" />,
                    label: 'Delete Account',
                    description: 'Permanently delete all data',
                    action: () => {
                        triggerImpactHaptic('medium');
                        setShowDeleteDialog(true);
                    },
                    destructive: true,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Profile Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName || 'Profile'}
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User size={32} className="text-primary" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold">
                                    {user?.displayName || 'User'}
                                </h2>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={plan === 'free' ? 'secondary' : 'default'}>
                                        {plan === 'free' ? 'Free' : plan === 'pro' ? 'Pro' : 'Unlimited'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {userProfile?.leadMagnetsCreated || 0}{' '}
                                        {limits.maxLeadMagnets === -1
                                            ? 'lead magnets'
                                            : `/ ${limits.maxLeadMagnets} lead magnets`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {plan === 'free' && (
                            <Button
                                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500"
                                onClick={() => navigate('/paywall')}
                            >
                                <Crown size={18} weight="fill" className="mr-2" />
                                Upgrade to Pro
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Settings Sections */}
                {sections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.05 }}
                        className="mb-6"
                    >
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                            {section.title}
                        </h3>
                        <Card>
                            <CardContent className="p-0">
                                {section.items.map((item, itemIndex) => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left ${itemIndex !== section.items.length - 1
                                            ? 'border-b border-border'
                                            : ''
                                            } ${item.destructive ? 'text-red-500' : ''}`}
                                    >
                                        <div className="flex-shrink-0">{item.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.label}</span>
                                                {item.badge && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                        <CaretRight
                                            size={18}
                                            className="text-muted-foreground flex-shrink-0"
                                        />
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {/* App Info */}
                <div className="text-center text-sm text-muted-foreground mt-8">
                    <p>LeadMagnet AI v1.0.0</p>
                </div>
            </div>

            {/* Sign Out Dialog */}
            <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign Out</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to sign out?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowSignOutDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSignOut}>Sign Out</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Delete Account</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. All your lead magnets and data will
                            be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
