'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Sparkles, Mail } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('If this email exists, a reset code has been sent.');
    } catch {
      toast.error(t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-heading font-bold text-white">{t('auth.forgot_password')}</h1>
            <p className="text-dark-500 text-sm mt-1">Enter your email to receive a reset code.</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} className="input-field pl-10" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t('common.loading') : t('common.submit')}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success" />
              </div>
              <p className="text-white mb-2">Check your email!</p>
              <p className="text-dark-500 text-sm mb-6">We sent a 6-digit code to <span className="text-primary">{email}</span></p>
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="btn-primary inline-block">
                Enter Reset Code
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-dark-500">
            <Link href="/login" className="text-primary font-medium">{t('common.back')} to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
