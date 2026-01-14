import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Crown,
    Shield,
    FileText,
    SignOut,
    CaretRight,
    Envelope,
    Trash,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
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
import { signOut, deleteUserAccount } from '@/lib/firebase';
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
    const [isDeleting, setIsDeleting] = useState(false);

    const plan = userProfile?.plan || 'free';

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
        if (!user) return;

        setIsDeleting(true);
        triggerImpactHaptic('heavy');

        try {
            await deleteUserAccount(user.uid);
            triggerNotificationHaptic('success');
            navigate('/');
        } catch (error: any) {
            console.error('Account deletion error:', error);
            triggerNotificationHaptic('error');

            // Firebase requires recent authentication for account deletion
            if (error?.code === 'auth/requires-recent-login') {
                alert('For security, please sign out and sign back in before deleting your account.');
            } else {
                alert('Failed to delete account. Please contact support at hello@inkfluenceai.com');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    const openURL = (url: string) => {
        window.open(url, '_blank');
    };

    const sections: SettingSection[] = [
        {
            title: 'Account',
            items: [
                {
                    icon: <FileText size={18} className="text-muted-foreground" />,
                    label: 'My Lead Magnets',
                    description: 'View all your creations',
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/dashboard');
                    },
                },
                {
                    icon: <Crown size={18} weight="fill" className="text-amber-500" />,
                    label: 'Subscription',
                    description: plan === 'free' ? 'Free Plan' : plan === 'pro' ? 'Pro Plan' : 'Unlimited',
                    badge: plan !== 'free' ? 'Active' : undefined,
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/paywall');
                    },
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: <Envelope size={18} className="text-muted-foreground" />,
                    label: 'Contact Support',
                    description: 'Get help with any issues',
                    action: () => openURL('mailto:hello@inkfluenceai.com'),
                    external: true,
                },
            ]
        },
        {
            title: 'Legal',
            items: [
                {
                    icon: <Shield size={18} className="text-muted-foreground" />,
                    label: 'Privacy Policy',
                    action: () => {
                        triggerImpactHaptic('light');
                        navigate('/privacy');
                    },
                },
                {
                    icon: <FileText size={18} className="text-muted-foreground" />,
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
                    icon: <SignOut size={18} className="text-destructive" />,
                    label: 'Sign Out',
                    action: () => setShowSignOutDialog(true),
                    destructive: true,
                },
                {
                    icon: <Trash size={18} className="text-destructive" />,
                    label: 'Delete Account',
                    description: 'Permanently remove all data',
                    action: () => setShowDeleteDialog(true),
                    destructive: true,
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account and preferences
                    </p>
                </div>

                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div key={index} className="space-y-3">
                            <h2 className="text-sm font-medium text-muted-foreground ml-1 uppercase tracking-wider">
                                {section.title}
                            </h2>
                            <div className="bg-card rounded-xl border shadow-sm divide-y">
                                {section.items.map((item, itemIndex) => (
                                    <button
                                        key={itemIndex}
                                        onClick={item.action}
                                        className={`w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 ${item.destructive ? 'hover:bg-destructive/5' : ''
                                            } first:rounded-t-xl last:rounded-b-xl`}
                                    >
                                        <div className={`p-2 rounded-md bg-muted/50 ${item.destructive ? 'bg-destructive/10' : ''
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-medium ${item.destructive ? 'text-destructive' : 'text-foreground'
                                                    }`}>
                                                    {item.label}
                                                </span>
                                                {item.badge && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
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
                                        <CaretRight size={16} className="text-muted-foreground/50" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dialogs remain same, just updated trigger locations */}
            <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center">
                        <DialogTitle className="text-xl">Sign Out</DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to sign out of your account?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-col pt-4">
                        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setShowSignOutDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteDialog} onOpenChange={(open) => !isDeleting && setShowDeleteDialog(open)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center">
                        <DialogTitle className="text-xl">Delete Account</DialogTitle>
                        <DialogDescription className="pt-2">
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-col pt-4">
                        <Button variant="destructive" className="w-full" onClick={handleDeleteAccount} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
