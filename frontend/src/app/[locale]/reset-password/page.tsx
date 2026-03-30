'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useRouter, Link } from '@/i18n/routing';
import { Sparkles, Lock, Key } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, code, new_password: newPassword });
      toast.success('Password reset successfully! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-heading font-bold text-white">Reset Password</h1>
            <p className="text-dark-500 text-sm mt-1">Enter the code from your email and set a new password.</p>
            {email && <p className="text-primary text-xs mt-2">{email}</p>}
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="6-digit code" className="input-field pl-10 text-center tracking-widest font-mono" maxLength={6} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('settings.new_password')} className="input-field pl-10" required minLength={8} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="input-field pl-10" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : 'Reset Password'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500">
            <Link href="/login" className="text-primary font-medium">{t('common.back')} to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
