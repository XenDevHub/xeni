'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatCard } from '@/components/admin/StatCard';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { UserGrowthChart } from '@/components/admin/charts/UserGrowthChart';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { Users, DollarSign, CreditCard, Zap, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip } from 'recharts';
import { Link } from '@/i18n/routing';

const MOCK_REVENUE_DATA = [
  { month: 'Jan', Starter: 40000, Professional: 24000, Premium: 24000 },
  { month: 'Feb', Starter: 30000, Professional: 13980, Premium: 22100 },
  { month: 'Mar', Starter: 20000, Professional: 98000, Premium: 22900 },
  { month: 'Apr', Starter: 27800, Professional: 39080, Premium: 20000 },
  { month: 'May', Starter: 18900, Professional: 48000, Premium: 21810 },
  { month: 'Jun', Starter: 23900, Professional: 38000, Premium: 25000 },
  { month: 'Jul', Starter: 34900, Professional: 43000, Premium: 21000 },
];

const MOCK_GROWTH_DATA = [
  { month: 'Jan', users: 100 }, { month: 'Feb', users: 150 }, { month: 'Mar', users: 280 },
  { month: 'Apr', users: 450 }, { month: 'May', users: 800 }, { month: 'Jun', users: 1200 },
];

const MOCK_PLAN_DISTRIBUTION = [
  { name: 'Starter', value: 400, color: '#06B6D4' },
  { name: 'Professional', value: 300, color: '#7C3AED' },
  { name: 'Premium', value: 300, color: '#10B981' },
];

export default function AdminOverview() {
  const { data: metrics } = useQuery({
    queryKey: ['admin-overview-metrics'],
    queryFn: async () => {
      // Typically `await api.get('/admin/overview');`
      return {
        totalUsers: 1024, userChange: 12.5,
        monthlyRevenue: 245000, revenueChange: 8.2,
        activeSubscriptions: 850, subChange: -2.1,
        tasksToday: 12500, taskChange: 15.4,
      };
    }
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto pb-24">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Overview Dashboard</h1>
        <p className="text-dark-500">Platform analytics and real-time performance metrics.</p>
      </div>

      {/* Top Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 ml:grid-cols-4 gap-6">
        <StatCard 
          label="Total Users" 
          value={metrics?.totalUsers.toLocaleString() || '...'} 
          icon={Users} color="text-cyan-400"
          change={{ value: `${metrics?.userChange}%`, isPositive: true }}
          delay={0.1}
        />
        <StatCard 
          label="Monthly Revenue" 
          value={`৳${(metrics?.monthlyRevenue || 0).toLocaleString()}`} 
          icon={DollarSign} color="text-emerald-400"
          change={{ value: `${metrics?.revenueChange}%`, isPositive: true }}
          delay={0.2}
        />
        <StatCard 
          label="Active Subscriptions" 
          value={metrics?.activeSubscriptions.toLocaleString() || '...'} 
          icon={CreditCard} color="text-primary-400"
          change={{ value: `${Math.abs(metrics?.subChange || 0)}%`, isPositive: false }}
          delay={0.3}
        />
        <StatCard 
          label="AI Tasks Today" 
          value={metrics?.tasksToday.toLocaleString() || '...'} 
          icon={Zap} color="text-amber-400"
          change={{ value: `${metrics?.taskChange}%`, isPositive: true }}
          delay={0.4}
        />
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-heading font-semibold text-white mb-6">Revenue Over Time</h3>
          <RevenueChart data={MOCK_REVENUE_DATA} />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-6">User Growth</h3>
          <UserGrowthChart data={MOCK_GROWTH_DATA} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plan Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> Plan Distribution
          </h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={MOCK_PLAN_DISTRIBUTION} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {MOCK_PLAN_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <PieTooltip contentStyle={{ backgroundColor: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm text-dark-500">Total Active</span>
              <span className="text-xl font-bold text-white">1,000</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {MOCK_PLAN_DISTRIBUTION.map(plan => (
              <div key={plan.name} className="flex items-center gap-1.5 text-xs text-dark-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                {plan.name}
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-white mb-6">Top Active Users</h3>
          <div className="space-y-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">US</div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">Top Seller Shop {i}</div>
                    <div className="text-xs text-dark-500">Joined Mar 2026 • Premium</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">4,520</div>
                  <div className="text-xs text-dark-500">Tasks this mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time feed */}
        <ActivityFeed />

      </div>
    </div>
  );
}
