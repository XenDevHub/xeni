'use client';

import { useSocketStore, SocketEvent } from '@/store/socket';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, UserPlus, CreditCard, Bot, AlertCircle } from 'lucide-react';

interface FeedItem {
  id: string;
  message: string;
  timestamp: number;
  type: 'user' | 'payment' | 'agent' | 'system' | 'escalation';
}

export function ActivityFeed() {
  const { lastEvent, isConnected } = useSocketStore();
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (lastEvent && lastEvent.event === 'admin.activity') {
      const payload = lastEvent.payload as any;
      setFeed(prev => {
        const newFeed = [{
          id: Math.random().toString(),
          message: payload?.message || 'Unknown activity',
          timestamp: lastEvent.timestamp,
          type: payload?.type || 'system'
        }, ...prev].slice(0, 50);
        return newFeed;
      });
    }
  }, [lastEvent]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'agent': return <Bot className="w-4 h-4 text-primary-400" />;
      case 'escalation': return <AlertCircle className="w-4 h-4 text-danger" />;
      default: return <Activity className="w-4 h-4 text-dark-400" />;
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
      case 'payment': return 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
      case 'agent': return 'bg-primary-400 shadow-[0_0_8px_rgba(139,79,255,0.5)]';
      case 'escalation': return 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.5)]';
      default: return 'bg-dark-400';
    }
  };

  return (
    <div className="glass-card flex flex-col h-full max-h-[400px]">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-heading font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Live Activity
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-500">WebSocket {isConnected ? 'connected' : 'disconnected'}</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {feed.length === 0 ? (
          <div className="h-full flex items-center justify-center text-dark-500 text-sm">
            Waiting for activity...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {feed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                className="flex items-start gap-4"
              >
                <div className="relative mt-1">
                  <div className={`w-2 h-2 rounded-full ${getDotColor(item.type)}`} />
                  <div className="absolute top-4 left-[3px] w-[2px] h-[30px] bg-white/5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-600 group-hover:text-white transition-colors">
                    {item.message}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
