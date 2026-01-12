import { useState } from 'react';
import { X, Volume2, Music, Globe, Palette, Bell, Shield, Moon, Sun, Zap, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
}

interface SettingsState {
  soundEffects: boolean;
  backgroundMusic: boolean;
  volume: number;
  language: string;
  theme: string;
  notifications: boolean;
}

export function SettingsModal({ isOpen, onClose, childName }: SettingsModalProps) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    // Load existing settings from localStorage
    const saved = localStorage.getItem(`settings_${childName}`);
    return saved ? JSON.parse(saved) : {
      soundEffects: true,
      backgroundMusic: true,
      volume: 70,
      language: 'english',
      theme: 'colorful',
      notifications: true,
    };
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (key: string) => {
    setSettings((prev: SettingsState) => ({
      ...prev,
      [key]: !prev[key as keyof SettingsState]
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings((prev: SettingsState) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleVolumeChange = (value: number) => {
    setSettings((prev: SettingsState) => ({
      ...prev,
      volume: value
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem(`settings_${childName}`, JSON.stringify(settings));
    
    // Apply theme
    applyTheme(settings.theme);
    
    // Apply language
    applyLanguage(settings.language);
    
    toast.success('Settings saved successfully!');
    onClose();
  };

  const applyTheme = (theme: string) => {
    // Remove existing theme classes
    document.body.classList.remove('theme-colorful', 'theme-calm', 'theme-nature');
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Also save to localStorage for persistence
    localStorage.setItem('app-theme', theme);
  };

  const applyLanguage = (language: string) => {
    // Save language preference
    localStorage.setItem('app-language', language);
    
    // Display language change notification
    const languageNames = {
      english: 'English',
      filipino: 'Filipino',
      spanish: 'Spanish'
    };
    toast.info(`Language changed to ${languageNames[language as keyof typeof languageNames]}`);
  };

  const handleReset = () => {
    // Reset settings to default
    const defaultSettings = {
      soundEffects: true,
      backgroundMusic: true,
      volume: 70,
      language: 'english',
      theme: 'colorful',
      notifications: true,
    };
    setSettings(defaultSettings);
    localStorage.setItem(`settings_${childName}`, JSON.stringify(defaultSettings));
    
    // Apply default theme
    applyTheme('colorful');
    
    // Apply default language
    applyLanguage('english');
    
    setShowResetConfirm(false);
    toast.success('Settings reset to default!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl text-white">Settings</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 p-0"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Sound Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl text-purple-700">Sound & Music</h3>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <div>
                <Label className="text-purple-800 cursor-pointer">Sound Effects</Label>
                <p className="text-sm text-purple-600">Play sounds during activities</p>
              </div>
              <button
                onClick={() => handleToggle('soundEffects')}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.soundEffects ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Background Music Toggle */}
            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
              <div>
                <Label className="text-pink-800 cursor-pointer flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Background Music
                </Label>
                <p className="text-sm text-pink-600">Play music while learning</p>
              </div>
              <button
                onClick={() => handleToggle('backgroundMusic')}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.backgroundMusic ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.backgroundMusic ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <Label className="text-blue-800 mb-3 block">Volume: {settings.volume}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-3 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Language Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl text-green-700">Language</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['english', 'filipino', 'spanish'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleSelect('language', lang)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.language === lang
                      ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {lang === 'english' && '🇺🇸'}
                    {lang === 'filipino' && '🇵🇭'}
                    {lang === 'spanish' && '🇪🇸'}
                  </div>
                  <p className="text-sm capitalize">{lang}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-xl text-yellow-700">Theme</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'colorful', label: 'Colorful', icon: Sun, gradient: 'from-purple-400 to-pink-400' },
                { value: 'calm', label: 'Calm', icon: Moon, gradient: 'from-blue-400 to-cyan-400' },
                { value: 'nature', label: 'Nature', icon: Palette, gradient: 'from-green-400 to-emerald-400' }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleSelect('theme', theme.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.theme === theme.value
                      ? `bg-gradient-to-br ${theme.gradient} border-white text-white shadow-lg scale-105`
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <theme.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm">{theme.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Other Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-xl text-indigo-700">Other Settings</h3>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
              <div>
                <Label className="text-indigo-800 cursor-pointer flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </Label>
                <p className="text-sm text-indigo-600">Get reminders and updates</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.notifications ? 'bg-indigo-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t-2 border-gray-200 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6"
          >
            Save Settings
          </Button>
          <Button
            onClick={() => setShowResetConfirm(true)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-6"
          >
            Reset Settings
          </Button>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300">
              <div className="p-6 space-y-6">
                <h2 className="text-2xl text-gray-800">Reset Settings</h2>
                <p className="text-gray-600">Are you sure you want to reset all settings to default?</p>
              </div>
              <div className="sticky bottom-0 bg-gray-50 p-6 border-t-2 border-gray-200 flex gap-3">
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-6"
                >
                  Reset
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}
