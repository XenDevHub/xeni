'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from '@/i18n/routing';
import { Shield, Users, Zap, CreditCard, Activity, BarChart3, Eye, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Metrics {
  total_users: number;
  total_tasks: number;
  active_subscriptions: number;
  tasks_by_agent: { agent_type: string; count: number }[];
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

const agentColors: Record<string, string> = {
  seo_audit: 'bg-violet-500',
  lead_generation: 'bg-cyan-500',
  social_media: 'bg-pink-500',
  content_writing: 'bg-emerald-500',
  email_marketing: 'bg-amber-500',
  analytics: 'bg-indigo-500',
};

export default function AdminPage() {
  const t = useTranslations();
  const { user } = useAuthStore();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [tab, setTab] = useState<'overview' | 'users'>('overview');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      toast.error('Access denied');
      router.push('/dashboard');
      return;
    }
    loadMetrics();
    loadUsers();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      setMetrics(res.data.data);
    } catch {}
  };

  const loadUsers = async () => {
    try {
      const res = await api.get(`/admin/users?page=${page}&per_page=20`);
      setUsers(res.data.data || []);
    } catch {}
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus}`);
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const statCards = metrics ? [
    { label: 'Total Users', value: metrics.total_users, icon: Users, color: 'text-cyan-400' },
    { label: 'Total Tasks', value: metrics.total_tasks, icon: Zap, color: 'text-purple-400' },
    { label: 'Active Subs', value: metrics.active_subscriptions, icon: CreditCard, color: 'text-emerald-400' },
  ] : [];

  return (
    <div className="min-h-screen bg-dark px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-heading font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${tab === 'overview' ? 'bg-primary text-white' : 'bg-white/5 text-dark-500 hover:bg-white/10'}`}>
            <Activity className="w-4 h-4" /> Overview
          </button>
          <button onClick={() => setTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${tab === 'users' ? 'bg-primary text-white' : 'bg-white/5 text-dark-500 hover:bg-white/10'}`}>
            <Users className="w-4 h-4" /> Users
          </button>
        </div>

        {tab === 'overview' && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-dark-500 text-sm">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-heading font-bold text-white">{stat.value.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            {/* Tasks by Agent */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Tasks by Agent
              </h3>
              <div className="space-y-3">
                {metrics?.tasks_by_agent?.map(item => {
                  const max = Math.max(...(metrics.tasks_by_agent?.map(a => a.count) || [1]));
                  const pct = (item.count / max) * 100;
                  return (
                    <div key={item.agent_type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-dark-600 capitalize">{item.agent_type.replace(/_/g, ' ')}</span>
                        <span className="text-white font-medium">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${agentColors[item.agent_type] || 'bg-primary'}`} />
                      </div>
                    </div>
                  );
                })}
                {(!metrics?.tasks_by_agent || metrics.tasks_by_agent.length === 0) && (
                  <p className="text-dark-500 text-center py-4">No task data yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-dark-500 font-medium px-6 py-3">Name</th>
                  <th className="text-left text-dark-500 font-medium px-6 py-3">Email</th>
                  <th className="text-left text-dark-500 font-medium px-6 py-3">Role</th>
                  <th className="text-left text-dark-500 font-medium px-6 py-3">Status</th>
                  <th className="text-left text-dark-500 font-medium px-6 py-3">Joined</th>
                  <th className="text-right text-dark-500 font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{u.full_name}</td>
                    <td className="px-6 py-4 text-dark-600">{u.email}</td>
                    <td className="px-6 py-4"><span className="badge bg-primary/20 text-primary">{u.role}</span></td>
                    <td className="px-6 py-4">
                      <span className={u.status === 'active' ? 'badge-success' : 'badge-danger'}>{u.status}</span>
                    </td>
                    <td className="px-6 py-4 text-dark-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleUserStatus(u.id, u.status)} className="text-dark-500 hover:text-white transition-colors p-1 rounded" title={u.status === 'active' ? 'Suspend' : 'Activate'}>
                        {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-dark-500 py-8">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
