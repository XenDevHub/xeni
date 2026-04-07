'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Activity, DollarSign, Bot, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface UserDetailPanelProps {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailPanel({ userId, onClose }: UserDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'payments' | 'conversations'>('overview');

  // Typically fetch user data based on userId here. 
  // For UI scaffolding, we use mock data.
  const user = {
    full_name: 'Abdur Rahman',
    email: 'abdur@example.com',
    role: 'user',
    status: 'active',
    plan: 'professional',
    joined: '2026-01-15',
    total_spent: 15000,
    total_tasks: 4520,
    orders_processed: 620,
    messages_replied: 3200,
  };

  return (
    <AnimatePresence>
      {userId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[480px] bg-dark border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-black/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-glow-accent">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
                    <p className="text-sm text-dark-500">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge bg-primary/20 text-primary capitalize">{user.role}</span>
                      <span className="badge bg-success/20 text-success capitalize">{user.status}</span>
                    </div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-dark-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-[-1px]">
                {['overview', 'tasks', 'payments', 'conversations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                      activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-dark-500 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <Bot className="w-5 h-5 text-primary mb-2" />
                      <div className="text-2xl font-bold text-white">{user.total_tasks}</div>
                      <div className="text-xs text-dark-500">Total Tasks</div>
                    </div>
                    <div className="glass-card p-4">
                      <DollarSign className="w-5 h-5 text-emerald-400 mb-2" />
                      <div className="text-2xl font-bold text-white">৳{user.total_spent.toLocaleString()}</div>
                      <div className="text-xs text-dark-500">Total Spent</div>
                    </div>
                    <div className="glass-card p-4">
                      <Activity className="w-5 h-5 text-cyan-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{user.orders_processed}</div>
                      <div className="text-xs text-dark-500">Orders Processed</div>
                    </div>
                    <div className="glass-card p-4">
                      <MessageSquare className="w-5 h-5 text-pink-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{user.messages_replied}</div>
                      <div className="text-xs text-dark-500">Messages Replied</div>
                    </div>
                  </div>

                  {/* Subscription Info */}
                  <div className="border border-white/10 rounded-2xl p-5 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">Subscription Setup</h4>
                      <span className="badge bg-primary/20 text-primary uppercase text-[10px] tracking-wider">{user.plan}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-dark-500">Billing Cycle</span>
                        <span className="text-white">Monthly</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-dark-500">Next Due Date</span>
                        <span className="text-white">15 April 2026</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-dark-500">Member Since</span>
                        <span className="text-white flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(user.joined).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Connected Pages */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-500 mb-3 uppercase tracking-wider">Connected FB Pages</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">FB</div>
                        <div className="flex-1">
                          <div className="text-sm text-white">Fashion Hub BD</div>
                          <div className="text-xs text-success flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-success" /> Setup complete
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div className="text-center py-10 text-dark-500 text-sm">Task history will appear here.</div>
              )}
              {activeTab === 'payments' && (
                <div className="text-center py-10 text-dark-500 text-sm">Payment history will appear here.</div>
              )}
              {activeTab === 'conversations' && (
                <div className="text-center py-10 text-dark-500 text-sm">Conversation stats will appear here.</div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
              <button className="flex-1 btn-primary py-2 text-sm">Send Email</button>
              <button className="flex-1 btn-secondary py-2 text-sm text-danger border-danger/30 hover:border-danger hover:shadow-glow-danger hover:bg-danger/10">Suspend User</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
