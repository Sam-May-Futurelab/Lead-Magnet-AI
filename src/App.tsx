import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { Header } from '@/components/Header';
import { HomePage } from '@/components/HomePage';
import { CreatePage } from '@/components/CreatePage';
import { DashboardPage } from '@/components/DashboardPage';
import { AuthModal } from '@/components/AuthModal';
import { cn } from '@/lib/utils';

function AppContent() {
  const { user, loading } = useAuth();
  const { actualTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <div className={cn('min-h-screen bg-background', actualTheme === 'dark' && 'dark')}>
      <Header onAuthClick={() => setShowAuthModal(true)} />
      
      <main className="safe-bottom">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/" 
            element={<HomePage onAuthClick={() => setShowAuthModal(true)} />} 
          />
          
          {/* Protected routes */}
          <Route 
            path="/create" 
            element={
              user ? <CreatePage /> : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <DashboardPage /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Profile route - placeholder */}
          <Route 
            path="/profile" 
            element={
              user ? (
                <div className="container py-8 px-4 max-w-2xl mx-auto">
                  <h1 className="text-3xl font-bold mb-4">Profile</h1>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              ) : <Navigate to="/" replace />
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
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
