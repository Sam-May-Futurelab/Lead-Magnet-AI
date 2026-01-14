import { Link, useLocation } from 'react-router-dom';
import { Sparkle, Plus, List, House, User } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { triggerImpactHaptic } from '@/lib/haptics';

interface HeaderProps {
  onAuthClick?: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { user, userProfile } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => triggerImpactHaptic('light')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Sparkle size={18} className="text-white" weight="fill" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">Lead Magnet AI</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              size="sm"
              className="gap-2"
              onClick={() => triggerImpactHaptic('light')}
            >
              <House size={18} />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>

          {user && (
            <>
              <Link to="/dashboard">
                <Button
                  variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  onClick={() => triggerImpactHaptic('light')}
                >
                  <List size={18} />
                  <span className="hidden sm:inline">My Magnets</span>
                </Button>
              </Link>

              <Link to="/create">
                <Button
                  variant="gradient"
                  size="sm"
                  className="gap-2"
                  onClick={() => triggerImpactHaptic('medium')}
                >
                  <Plus size={18} weight="bold" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </Link>
            </>
          )}

          {/* Auth button */}
          {user ? (
            <Link to="/profile">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => triggerImpactHaptic('light')}
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User size={20} />
                )}
              </Button>
            </Link>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                triggerImpactHaptic('light');
                onAuthClick?.();
              }}
            >
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
