'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { setAuth, setSubscription } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, totp_code: totpCode || undefined });
      const { access_token, refresh_token, user } = res.data.data;
      setAuth(user, access_token, refresh_token);
      // Fetch subscription
      try { const subRes = await api.get('/billing/subscription', { headers: { Authorization: `Bearer ${access_token}` } }); if (subRes.data.data?.plan_tier) setSubscription(subRes.data.data); } catch {}
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error;
      if (msg?.includes('2FA')) {
        setNeeds2FA(true);
      } else {
        toast.error(msg || t('errors.invalid_credentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const res = await api.post('/auth/google/callback', {
          google_id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture || '',
        });

        const { access_token, refresh_token, user } = res.data.data;
        setAuth(user, access_token, refresh_token);
        // Fetch subscription
        try { const subRes = await api.get('/billing/subscription', { headers: { Authorization: `Bearer ${access_token}` } }); if (subRes.data.data?.plan_tier) setSubscription(subRes.data.data); } catch {}
        toast.success('Successfully Authenticated with Google!');
        router.push('/dashboard');
      } catch (err: any) {
        toast.error('Backend Integration Failed with Google Auth Profile.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Consent Popup closed or failed.'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-heading font-bold text-white">{t('auth.login_title')}</h1>
            <p className="text-dark-500 text-sm mt-1">{t('auth.login_subtitle')}</p>
          </div>

          <button type="button" onClick={() => loginWithGoogle()} className="btn-secondary w-full flex items-center justify-center gap-3 mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('auth.google_login')}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-dark-500 text-sm">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} className="input-field pl-10" required autoComplete="email" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-dark-500" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} className="input-field pl-10 pr-10" required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-dark-500 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {needs2FA && (
              <input type="text" value={totpCode} onChange={e => setTotpCode(e.target.value)} placeholder="2FA Code" className="input-field text-center tracking-widest" maxLength={6} />
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('nav.login')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/forgot-password" className="text-primary hover:text-primary-400">{t('auth.forgot_password')}</Link>
            <p className="mt-3 text-dark-500">
              {t('auth.no_account')}{' '}
              <Link href="/register" className="text-primary hover:text-primary-400 font-medium">{t('nav.register')}</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
