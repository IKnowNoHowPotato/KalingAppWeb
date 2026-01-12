import { useState } from 'react';
import { Sparkles, User, Mail, Calendar, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { createRegistration, createUserDocWithUid } from '../services/firestoreService';
import { registerWithEmail } from '../../firebase';

interface RegistrationFormProps {
  onSuccess: (childName: string, registrationId: number) => void;
  onSwitchToLogin: () => void;
}

export function RegistrationForm({
  onSuccess,
  onSwitchToLogin,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
    parentalConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.childName ||
      !formData.parentName ||
      !formData.email ||
      !formData.age ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error('Please fill in all fields!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!formData.parentalConsent) {
      toast.error('Parental consent is required!');
      return;
    }

    // Local-only ID (NOT auth identity)
    const localId = Date.now();

    const newRegistration = {
      childName: formData.childName,
      parentName: formData.parentName,
      email: formData.email,
      age: formData.age,
      parentalConsent: formData.parentalConsent,
      localId,
      registeredAt: new Date().toISOString(),
    };

    // Persist locally (non-auth reference only)
    const registrations = JSON.parse(
      localStorage.getItem('users') || '[]'
    );
    registrations.push(newRegistration);
    localStorage.setItem('users', JSON.stringify(registrations));

    try {
      setIsSubmitting(true);

      // 🔐 CREATE FIREBASE AUTH USER
      const cred = await registerWithEmail(
        formData.email,
        formData.password
      );

      const uid = cred.user.uid;

      // 🔑 FIRESTORE DOC ID === AUTH UID
      const firestoreUserRecord = {
        uid,
        ...newRegistration,
        provider: 'password',
      };

      await createUserDocWithUid(uid, firestoreUserRecord as any);

      toast.success(
        `Account created. Welcome ${formData.childName}! 🎉`
      );
    } catch (err: any) {
      console.warn('Auth registration error', err);

      if (err?.message)
        toast.error(`Auth error: ${err.message}`);
      else if (err?.code)
        toast.error(`Auth error: ${err.code}`);

      // Fallback (non-auth, legacy support)
      try {
        await createRegistration(newRegistration as any);
        toast.success(
          `Saved to cloud (no auth). Welcome ${formData.childName}! 🎉`
        );
      } catch (e) {
        console.warn('createRegistration fallback failed', e);
        toast.error(
          'Saved locally, but failed to save to cloud.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }

    onSuccess(formData.childName, localId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-purple-300 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join Our Fun App!
          </h1>
          <p className="text-gray-600">
            Sign up and start your amazing adventure! 🚀
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="childName" className="flex items-center gap-2 text-purple-700">
              <User className="w-5 h-5" />
              Child's Name
            </Label>
            <Input
              id="childName"
              type="text"
              placeholder="Enter your name"
              value={formData.childName}
              onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              className="border-2 border-purple-200 focus:border-purple-500 text-lg p-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5" />
              Age
            </Label>
            <Input
              id="age"
              type="number"
              min="3"
              max="17"
              placeholder="How old are you?"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="border-2 border-blue-200 focus:border-blue-500 text-lg p-6"
            />
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-3">
              <Shield className="w-6 h-6" />
              <span>Parent/Guardian Information</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName" className="text-gray-700">
                Parent/Guardian Name
              </Label>
              <Input
                id="parentName"
                type="text"
                placeholder="Parent's name"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="border-2 border-yellow-200 focus:border-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                Guardian's Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-2 border-yellow-200 focus:border-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-2 border-yellow-200 focus:border-yellow-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-700">
                <Lock className="w-4 h-4" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="border-2 border-yellow-200 focus:border-yellow-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consent"
                checked={formData.parentalConsent}
                onChange={(e) => setFormData({ ...formData, parentalConsent: e.target.checked })}
                className="w-5 h-5 mt-1 rounded border-2 border-yellow-400 text-yellow-600 focus:ring-yellow-500"
              />
              <Label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                I am the parent/guardian and I give permission for my child to use this app. 
                I understand that this is a child-friendly educational application.
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl py-7 shadow-lg hover:shadow-xl transition-all"
          >
            Start My Adventure! 🌟
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Log in here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}