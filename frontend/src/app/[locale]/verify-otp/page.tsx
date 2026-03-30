'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { Sparkles, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

export default function VerifyOTPPage() {
  const t = useTranslations();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    const digits = pasted.split('');
    const newCode = [...code];
    digits.forEach((d, i) => { if (i < 6) newCode[i] = d; });
    setCode(newCode);
  };

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code: otp });
      toast.success('Email verified! You can now log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('New code sent to your email!');
    } catch {
      toast.error('Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-white mb-1">{t('auth.verify_title')}</h1>
          <p className="text-dark-500 text-sm mb-2">{t('auth.verify_subtitle')}</p>
          {email && <p className="text-primary text-sm mb-8">{email}</p>}

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value.replace(/\D/, ''))}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-mono font-bold input-field focus:ring-primary"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || code.join('').length !== 6} className="btn-primary w-full mb-4">
            {loading ? t('common.loading') : t('common.confirm')}
          </button>

          <p className="text-dark-500 text-sm">
            Didn&apos;t receive the code?{' '}
            <button onClick={handleResend} className="text-primary hover:text-primary-400 font-medium">Resend</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
