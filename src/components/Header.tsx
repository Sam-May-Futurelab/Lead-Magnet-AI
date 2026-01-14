import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Gear, House } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { triggerImpactHaptic } from '@/lib/haptics';

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerImpactHaptic('light');
    if (location.pathname === '/settings') {
      navigate(-1);
    } else {
      navigate('/settings');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-top">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2"
          onClick={() => triggerImpactHaptic('light')}
        >
          <House size={24} weight="fill" className="text-primary" />
          <span className="font-bold text-lg hidden sm:inline">Lead Magnet AI</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
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

          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Gear size={20} />
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
