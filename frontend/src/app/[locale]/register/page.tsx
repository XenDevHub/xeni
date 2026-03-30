'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { Sparkles, Mail, Lock, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Check your email for verification code.');
      router.push('/verify-otp?email=' + form.email);
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('errors.server_error'));
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
            <h1 className="text-2xl font-heading font-bold text-white">{t('auth.register_title')}</h1>
            <p className="text-dark-500 text-sm mt-1">{t('auth.register_subtitle')}</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder={t('auth.full_name')} className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder={t('auth.email')} className="input-field pl-10" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={t('auth.password')} className="input-field pl-10" required minLength={8} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? t('common.loading') : t('nav.register')}</button>
          </form>
          <p className="mt-6 text-center text-sm text-dark-500">
            {t('auth.has_account')}{' '}
            <Link href="/login" className="text-primary font-medium">{t('nav.login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
