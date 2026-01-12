import { useState } from 'react';
import { X, User, Lock, Phone, RotateCcw, AlertTriangle, BookOpen, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  childName: string;
}

export function AccountModal({ isOpen, onClose, childId, childName }: AccountModalProps) {
  const [contactNumber, setContactNumber] = useState(() => {
    const registrations = JSON.parse(localStorage.getItem('users') || '[]');
    const child = registrations.find((r: any) => r.id === childId);
    return child?.contactNumber || '';
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showStoryResetConfirm, setShowStoryResetConfirm] = useState(false);
  const [showLevelResetConfirm, setShowLevelResetConfirm] = useState(false);

  const handleContactUpdate = () => {
    if (!contactNumber.trim()) {
      toast.error('Please enter a contact number');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9+\-() ]{10,}$/;
    if (!phoneRegex.test(contactNumber)) {
      toast.error('Please enter a valid contact number');
      return;
    }

    // Update contact number in localStorage
    const registrations = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedRegistrations = registrations.map((r: any) => {
      if (r.id === childId) {
        return { ...r, contactNumber };
      }
      return r;
    });
    localStorage.setItem('users', JSON.stringify(updatedRegistrations));
    
    toast.success('Contact number updated successfully!');
  };

  const handlePasswordReset = () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Verify old password
    const registrations = JSON.parse(localStorage.getItem('users') || '[]');
    const child = registrations.find((r: any) => r.id === childId);
    
    if (!child || child.password !== oldPassword) {
      toast.error('Current password is incorrect');
      return;
    }

    // Update password
    const updatedRegistrations = registrations.map((r: any) => {
      if (r.id === childId) {
        return { ...r, password: newPassword };
      }
      return r;
    });
    localStorage.setItem('users', JSON.stringify(updatedRegistrations));

    // Clear form
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    toast.success('Password changed successfully!');
  };

  const handleStoryReset = () => {
    // Reset story progress
    localStorage.removeItem(`story_progress_${childId}`);
    setShowStoryResetConfirm(false);
    toast.success('Story progress has been reset!');
  };

  const handleLevelReset = () => {
    // Reset level progress
    localStorage.removeItem(`level_progress_${childId}`);
    setShowLevelResetConfirm(false);
    toast.success('Level progress has been reset!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-blue-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl text-white">Account Settings</h2>
                <p className="text-blue-100">{childName}</p>
              </div>
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
          {/* Contact Number Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl text-green-700">Contact Number</h3>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 space-y-3">
              <Label htmlFor="contact" className="text-green-800">Guardian's Contact Number</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="border-2 border-green-300 focus:border-green-500"
              />
              <Button
                onClick={handleContactUpdate}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Update Contact Number
              </Button>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl text-purple-700">Change Password</h3>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200 space-y-3">
              <div>
                <Label htmlFor="oldPassword" className="text-purple-800">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-purple-800">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-purple-800">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="border-2 border-purple-300 focus:border-purple-500 mt-1"
                />
              </div>

              <Button
                onClick={handlePasswordReset}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl text-orange-700">Reset Progress</h3>
            </div>

            {/* Story Progress Reset */}
            <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                  <div>
                    <Label className="text-orange-800">Story Progress</Label>
                    <p className="text-sm text-orange-600">Reset all story reading progress</p>
                  </div>
                </div>
              </div>

              {!showStoryResetConfirm ? (
                <Button
                  onClick={() => setShowStoryResetConfirm(true)}
                  variant="outline"
                  className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Reset Story Progress
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">Are you sure? This cannot be undone!</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowStoryResetConfirm(false)}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStoryReset}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    >
                      Confirm Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Level Progress Reset */}
            <div className="p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-600" />
                  <div>
                    <Label className="text-pink-800">Level Progress</Label>
                    <p className="text-sm text-pink-600">Reset all level completion progress</p>
                  </div>
                </div>
              </div>

              {!showLevelResetConfirm ? (
                <Button
                  onClick={() => setShowLevelResetConfirm(true)}
                  variant="outline"
                  className="w-full border-2 border-pink-300 text-pink-700 hover:bg-pink-100"
                >
                  Reset Level Progress
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-700">Are you sure? This cannot be undone!</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowLevelResetConfirm(false)}
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 text-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLevelReset}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    >
                      Confirm Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 border-t-2 border-gray-200">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
