import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AnimatePresence, motion } from 'framer-motion';

function AppContent() {
  const { user, loading } = useAuth();
  const { actualTheme } = useTheme();
  const location = useLocation();

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
    <div className={cn('min-h-screen bg-background text-foreground transition-colors duration-300', actualTheme === 'dark' && 'dark')}>
      <Header />

      <main className="safe-bottom">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Default to dashboard when logged in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Main routes */}
            <Route
              path="/create"
              element={
                <PageTransition>
                  <CreatePage />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              }
            />
            <Route
              path="/settings"
              element={
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/paywall"
              element={
                <PageTransition>
                  <PaywallPage />
                </PageTransition>
              }
            />

            {/* Legal pages */}
            <Route
              path="/privacy"
              element={
                <PageTransition>
                  <PrivacyPolicyPage />
                </PageTransition>
              }
            />
            <Route
              path="/terms"
              element={
                <PageTransition>
                  <TermsOfServicePage />
                </PageTransition>
              }
            />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
