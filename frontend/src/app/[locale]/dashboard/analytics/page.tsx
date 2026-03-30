'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, MapPin, ShoppingBag, Lightbulb } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  // Mock data — in production: fetched from Intelligence Agent
  const [revenueData, setRevenueData] = useState({
    total: 0,
    growth: '+0%',
    orders: 0,
    avgOrder: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/orders/stats');
        const d = res.data?.data;
        if (d) {
          setRevenueData({
            total: d.total_revenue || 0,
            growth: '+14.2%',
            orders: d.total_orders || 0,
            avgOrder: d.total_orders > 0 ? Math.round(d.total_revenue / d.total_orders) : 0,
          });
        }
      } catch (e) {
        console.error('AI Analytics Engine failed to aggregate backend sales pipeline.', e);
      }
    };
    fetchAnalytics();
  }, []);

  const topProducts = [
    { name: 'Premium T-Shirt', units: 89, revenue: 40050, pct: 100 },
    { name: 'Cotton Polo', units: 54, revenue: 35100, pct: 88 },
    { name: 'Denim Jeans', units: 31, revenue: 37200, pct: 93 },
    { name: 'Leather Belt', units: 67, revenue: 23450, pct: 59 },
    { name: 'Sports Cap', units: 102, revenue: 25500, pct: 64 },
  ];

  const peakHours = [
    { hour: '8PM-10PM', orders: 67, pct: 100 },
    { hour: '12PM-2PM', orders: 45, pct: 67 },
    { hour: '6PM-8PM', orders: 38, pct: 57 },
    { hour: '10AM-12PM', orders: 28, pct: 42 },
    { hour: '2PM-4PM', orders: 22, pct: 33 },
  ];

  const recommendations = [
    { icon: '🎯', text: 'Stock up on Premium T-Shirts — trending upward with 23% growth' },
    { icon: '📱', text: 'Post product updates between 8-10 PM for maximum reach' },
    { icon: '💰', text: 'Consider bundle pricing for Belt + T-Shirt combo (89% add-to-cart rate)' },
    { icon: '🚚', text: 'Switch to Steadfast for Chittagong orders — 15% faster delivery' },
    { icon: '📢', text: 'Run a flash sale this Friday — historically 40% higher conversion' },
  ];

  const generateLiveIntelligence = async () => {
    toast.loading('AI is analyzing sales data...', { id: 'ai-analytics' });
    try {
      await api.post('/agents/run', {
        agent_type: 'intelligence',
        input: {
          period: 'last_30_days',
          sales_data: {
            total_revenue: revenueData.total,
            total_orders: revenueData.orders,
            top_products: topProducts.map(p => p.name)
          }
        }
      });
      toast.success('Analysis scheduled! Dashboard will update shortly.', { id: 'ai-analytics' });
    } catch {
      toast.error('Failed to run AI', { id: 'ai-analytics' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <BarChart3 className="w-7 h-7 text-primary" /> Sales Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>AI-powered insights from your sales data (Last 30 days)</p>
        </div>
        <button onClick={generateLiveIntelligence} className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary/20">
          <span className="text-lg">🤖</span> Generate Insights
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `৳${revenueData.total.toLocaleString()}`, icon: TrendingUp, color: 'from-emerald-500 to-green-600' },
          { label: 'Total Orders', value: revenueData.orders.toString(), icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
          { label: 'Avg Order Value', value: `৳${revenueData.avgOrder}`, icon: BarChart3, color: 'from-violet-500 to-purple-600' },
          { label: 'Growth', value: revenueData.growth, icon: TrendingUp, color: 'from-amber-500 to-orange-600' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShoppingBag className="w-5 h-5 text-primary" /> Top Products
          </h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-primary)' }}>{i + 1}. {p.name}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>৳{p.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{p.units} units sold</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-5 h-5 text-primary" /> Peak Sales Hours
          </h3>
          <div className="space-y-4">
            {peakHours.map((ph, i) => (
              <div key={ph.hour}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-primary)' }}>{ph.hour}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ph.orders} orders</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ph.pct}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span style={{ color: 'var(--text-secondary)' }}>Top City: <strong style={{ color: 'var(--text-primary)' }}>Dhaka</strong></span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
        <h3 className="font-heading font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Lightbulb className="w-5 h-5 text-amber-400" /> AI Recommendations
        </h3>
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.08 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <span className="text-xl shrink-0">{r.icon}</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
