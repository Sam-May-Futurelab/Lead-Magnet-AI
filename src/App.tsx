import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { LoginPage } from '@/components/LoginPage';
import { CreatePage } from '@/components/CreatePage';
import { DashboardPage } from '@/components/DashboardPage';
import { SettingsPage } from '@/components/SettingsPage';
import { PaywallPage } from '@/components/PaywallPage';
import { PrivacyPolicyPage } from '@/components/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/components/TermsOfServicePage';
import { cn } from '@/lib/utils';

function AppContent() {
  const { user, loading } = useAuth();
  const { actualTheme } = useTheme();

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(actualTheme);
  }, [actualTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in - show login screen
  if (!user) {
    return (
      <div className={cn('min-h-screen bg-background', actualTheme === 'dark' && 'dark')}>
        <LoginPage />
      </div>
    );
  }

  // Logged in - show main app
  return (
    <div className={cn('min-h-screen bg-background', actualTheme === 'dark' && 'dark')}>
      <Header />

      <main className="safe-bottom">
        <Routes>
          {/* Default to dashboard when logged in */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main routes */}
          <Route path="/create" element={<CreatePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/paywall" element={<PaywallPage />} />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
