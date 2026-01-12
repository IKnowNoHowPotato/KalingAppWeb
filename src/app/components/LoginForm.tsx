import { useState } from 'react';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { loginWithEmail } from '../../firebase';
import { getUserByUid } from '../services/firestoreService';

interface LoginFormProps {
  onSuccess: (childName: string, registrationId: number) => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields!');
      return;
    }

    setIsSubmitting(true);
    try {
      const cred = await loginWithEmail(formData.email, formData.password)
      const uid = cred.user.uid
      const userDoc = await getUserByUid(uid) as any
      if (userDoc && userDoc.childName && userDoc.id) {
        toast.success(`Welcome back, ${userDoc.childName}! 🎉`)
        setIsSubmitting(false);
        onSuccess(userDoc.childName, userDoc.id)
        return
      }
    } catch (err) {
      console.warn('Cloud login failed', err)
    }

    // Fallback to localStorage `users`
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((reg: any) => reg.email === formData.email && reg.password === formData.password);
    if (!user) {
      toast.error('Invalid email or password!');
      setIsSubmitting(false);
      return;
    }

    toast.success(`Welcome back, ${user.childName}! 🎉`);
    onSuccess(user.childName, user.id);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-purple-300 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Log in to continue your learning journey! 🚀
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-purple-700">
              <Mail className="w-5 h-5" />
              Guardian's Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-2 border-purple-200 focus:border-purple-500 text-lg p-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2 text-blue-700">
              <Lock className="w-5 h-5" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-2 border-blue-200 focus:border-blue-500 text-lg p-6 pr-12"
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl py-7 shadow-lg hover:shadow-xl transition-all"
          >
            Log In 🌟
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-purple-600 hover:text-purple-700 underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}