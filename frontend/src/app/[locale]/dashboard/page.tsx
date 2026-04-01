'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, MessageCircle, AlertTriangle, TrendingUp, Package, ArrowUpRight, Wand2, BarChart3, Settings } from 'lucide-react';
import api from '@/lib/api';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/store/auth';

interface Stats {
  orders: { total_orders: number; pending_payment: number; pending_delivery: number; total_revenue: number };
  conversations: { open_conversations: number; resolved_conversations: number; total_unread: number };
}

export default function DashboardOverview() {
  const { subscription } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, convsRes] = await Promise.allSettled([
          api.get('/orders/stats'),
          api.get('/conversations/stats'),
        ]);
        setStats({
          orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data.data : { total_orders: 0, pending_payment: 0, pending_delivery: 0, total_revenue: 0 },
          conversations: convsRes.status === 'fulfilled' ? convsRes.value.data.data : { open_conversations: 0, resolved_conversations: 0, total_unread: 0 },
        });
      } catch {
        setStats({
          orders: { total_orders: 0, pending_payment: 0, pending_delivery: 0, total_revenue: 0 },
          conversations: { open_conversations: 0, resolved_conversations: 0, total_unread: 0 },
        });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: `৳${(stats?.orders.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-green-600', href: '/dashboard/analytics' },
    { title: 'Total Orders', value: (stats?.orders.total_orders || 0).toString(), icon: ShoppingBag, color: 'from-blue-500 to-indigo-600', href: '/dashboard/orders' },
    { title: 'Active Conversations', value: (stats?.conversations.open_conversations || 0).toString(), icon: MessageCircle, color: 'from-violet-500 to-purple-600', badge: stats?.conversations.total_unread, href: '/dashboard/conversations' },
    { title: 'Pending Deliveries', value: (stats?.orders.pending_delivery || 0).toString(), icon: AlertTriangle, color: 'from-amber-500 to-orange-600', href: '/dashboard/orders' },
  ];

  const quickActions = [
    { title: 'Add Product', description: 'Create a new product listing', icon: Package, href: '/dashboard/products', color: 'text-emerald-400' },
    { title: 'View Orders', description: `${stats?.orders.pending_payment || 0} payments to verify`, icon: ShoppingBag, href: '/dashboard/orders', color: 'text-blue-400' },
    { title: 'Open Inbox', description: `${stats?.conversations.total_unread || 0} unread messages`, icon: MessageCircle, href: '/dashboard/conversations', color: 'text-violet-400' },
    { title: 'Creative Studio', description: 'Generate captions & images', icon: Wand2, href: '/dashboard/creative', color: 'text-pink-400' },
    { title: 'Analytics', description: 'View sales intelligence', icon: BarChart3, href: '/dashboard/analytics', color: 'text-amber-400' },
    { title: 'Setup Guide', description: 'Configure your integrations', icon: Settings, href: '/dashboard/setup', color: 'text-cyan-400' },
  ];

  // Determine agent availability based on subscription
  const planTier = subscription?.plan_tier || 'free';
  const agentStatus = [
    { name: '💬 Conversation Agent', available: ['starter', 'professional', 'premium', 'enterprise'].includes(planTier), tier: 'Starter+' },
    { name: '📦 Order Processing Agent', available: ['professional', 'premium', 'enterprise'].includes(planTier), tier: 'Professional+' },
    { name: '📊 Inventory Agent', available: ['professional', 'premium', 'enterprise'].includes(planTier), tier: 'Professional+' },
    { name: '🎨 Creative Agent', available: ['premium', 'enterprise'].includes(planTier), tier: 'Premium' },
    { name: '🧠 Intelligence Agent', available: ['premium', 'enterprise'].includes(planTier), tier: 'Premium' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back! Here&apos;s your store overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={card.href} className="glass-card-hover p-5 block group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {card.badge ? (
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center animate-pulse-glow">
                    {card.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>
                {loading ? <span className="skeleton w-20 h-7 block" /> : card.value}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.title}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            <Link href={action.href} className="glass-card-hover p-5 flex items-start gap-4 group block">
              <action.icon className={`w-8 h-8 ${action.color} shrink-0 group-hover:scale-110 transition-transform`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{action.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{action.description}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: 'var(--text-muted)' }} />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pending Actions & Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Pending Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Payments to verify</span>
              <span className="badge-warning">{stats?.orders.pending_payment || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Orders to ship</span>
              <span className="badge-warning">{stats?.orders.pending_delivery || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unread messages</span>
              <span className="badge-danger">{stats?.conversations.total_unread || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>AI Agents</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Plan: <span className="text-primary font-semibold">{planTier.toUpperCase() || 'FREE'}</span>
          </p>
          <div className="space-y-3">
            {agentStatus.map(agent => (
              <div key={agent.name} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{agent.name}</span>
                {agent.available ? (
                  <span className="badge-success">Available</span>
                ) : (
                  <span className="badge text-[10px] px-2 py-0.5 opacity-60" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                    {agent.tier}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
