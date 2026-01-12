import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LoginForm } from './components/LoginForm';
import { RegistrationForm } from './components/RegistrationForm';
import { AssessmentForm } from './components/AssessmentForm';
import { StorySelection } from './components/StorySelection';
import { ChildDashboard } from './components/ChildDashboard';
import { onAuthChange } from '../firebase';
import type { User } from 'firebase/auth';

export default function App() {
  // Initialize state from localStorage to persist session across refreshes
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'assessment' | 'storySelection' | 'dashboard'>(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView ? (savedView as 'login' | 'register' | 'assessment' | 'storySelection' | 'dashboard') : 'login';
  });

  const [childInfo, setChildInfo] = useState(() => {
    const savedChildInfo = localStorage.getItem('childInfo');
    return savedChildInfo ? JSON.parse(savedChildInfo) : { name: '', id: 0 };
  });

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'colorful';
    document.body.classList.remove('theme-colorful', 'theme-calm', 'theme-nature');
    document.body.classList.add(`theme-${savedTheme}`);
  }, []);

  // Listen to Firebase auth state changes and clear app state if not authenticated
  useEffect(() => {
    const unsubscribe = onAuthChange((user: User | null) => {
      if (!user && currentView !== 'login' && currentView !== 'register') {
        // User is not authenticated but app thinks they are - clear state
        localStorage.removeItem('currentView');
        localStorage.removeItem('childInfo');
        setChildInfo({ name: '', id: 0 });
        setCurrentView('login');
      }
    });

    return unsubscribe;
  }, [currentView]);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('childInfo', JSON.stringify(childInfo));
  }, [childInfo]);

  const handleLoginSuccess = (childName: string, registrationId: number) => {
    setChildInfo({ name: childName, id: registrationId });
    setCurrentView('dashboard');
  };

  const handleRegistrationSuccess = (childName: string, registrationId: number) => {
    setChildInfo({ name: childName, id: registrationId });
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = () => {
    setCurrentView('storySelection');
  };

  const handleStorySelect = (storyType: 'pre-reader' | 'early-reader') => {
    setCurrentView('dashboard');
  };

  const handleGoToAssessment = () => {
    setCurrentView('assessment');
  };

  const handleLogout = () => {
    // Clear session data from localStorage on logout
    localStorage.removeItem('currentView');
    localStorage.removeItem('childInfo');
    setChildInfo({ name: '', id: 0 });
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <>
      {currentView === 'login' && (
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}
      {currentView === 'register' && (
        <RegistrationForm 
          onSuccess={handleRegistrationSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {currentView === 'assessment' && (
        <AssessmentForm 
          childName={childInfo.name}
          registrationId={childInfo.id}
          onComplete={handleAssessmentComplete}
        />
      )}
      {currentView === 'storySelection' && (
        <StorySelection
          userUid={childInfo.id}
          childName={childInfo.name}
          onStorySelect={handleStorySelect}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'dashboard' && (
        <ChildDashboard 
          userUid={childInfo.id}
          onLogout={handleLogout}
        />
      )}
      <Toaster position="top-center" richColors />
    </>
  );
}
