'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  { tier: 'free', agents: 1, tasks: 2, storage: '100MB', popular: false },
  { tier: 'basic', agents: 2, tasks: 10, storage: '1GB', popular: false },
  { tier: 'pro', agents: 5, tasks: 50, storage: '10GB', popular: true },
  { tier: 'enterprise', agents: 6, tasks: -1, storage: '100GB', popular: false },
];

const bdtPrices: Record<string, number> = { free: 0, basic: 999, pro: 2499, enterprise: 5999 };
const usdPrices: Record<string, number> = { free: 0, basic: 9, pro: 24, enterprise: 59 };

export default function BillingPage() {
  const t = useTranslations();
  const { user, subscription } = useAuthStore();
  const isBD = user?.country_code === 'BD';
  const prices = isBD ? bdtPrices : usdPrices;
  const currency = isBD ? '৳' : '$';
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') return;
    setLoading(tier);
    try {
      const endpoint = '/billing/subscribe/sslcommerz';
      const res = await api.post(endpoint, { plan_tier: tier });
      const data = res.data.data;
      if (data.redirect_url || data.session_url) {
        window.location.href = data.redirect_url || data.session_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || t('errors.server_error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold gradient-text mb-3">{t('nav.billing')}</h1>
          <p className="text-dark-500">{t('billing.current_plan')}: <span className="text-primary font-semibold">{subscription?.plan_tier?.toUpperCase() || 'FREE'}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => {
            const isActive = subscription?.plan_tier === plan.tier;
            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass-card p-6 ${plan.popular ? 'border-primary/50 shadow-glow' : ''} ${isActive ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAR
                  </div>
                )}

                <h3 className="text-lg font-heading font-bold text-white capitalize mb-1">{t(`billing.${plan.tier}`)}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">{currency}{prices[plan.tier]}</span>
                  <span className="text-dark-500 text-sm">{t('billing.month')}</span>
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-dark-600"><Check className="w-4 h-4 text-success" />{plan.agents} agent{plan.agents > 1 ? 's' : ''}</li>
                  <li className="flex items-center gap-2 text-dark-600"><Check className="w-4 h-4 text-success" />{plan.tasks === -1 ? t('billing.unlimited') : plan.tasks} {t('billing.tasks_per_day')}</li>
                  <li className="flex items-center gap-2 text-dark-600"><Check className="w-4 h-4 text-success" />{plan.storage} {t('billing.storage')}</li>
                </ul>

                {isActive ? (
                  <button disabled className="btn-secondary w-full opacity-50">Current Plan</button>
                ) : plan.tier === 'free' ? (
                  <button disabled className="btn-secondary w-full opacity-50">{t('billing.free')}</button>
                ) : (
                  <button onClick={() => handleSubscribe(plan.tier)} disabled={loading === plan.tier} className="btn-primary w-full">
                    {loading === plan.tier ? t('common.loading') : t('billing.pay_sslcommerz')}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
