import { BarChart3, User, Settings, LogOut, Sparkles, BookOpen, Layers } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationBarProps {
  childName: string;
  onLogout: () => void;
  onStatistics: () => void;
  onAccount: () => void;
  onSettings: () => void;
  onStory: () => void;
  onLevel: () => void;
  onFigma?: () => void;
}

export function NavigationBar({ childName, onLogout, onStatistics, onAccount, onSettings, onStory, onLevel }: NavigationBarProps) {
  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-purple-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Learning App
              </h1>
              <p className="text-sm text-gray-600">Welcome, {childName}!</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onStory}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Story
            </Button>
            
            <Button
              onClick={onLevel}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Level
            </Button>
            
            <Button
              onClick={onStatistics}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </Button>
            
            <Button
              onClick={onAccount}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Account
            </Button>
            
            <Button
              onClick={onSettings}
              className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>

            
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-2 border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}