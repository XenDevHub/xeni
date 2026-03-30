'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Plus, Trash2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ConnectedPage {
  id: string;
  page_id: string;
  page_name: string;
  page_picture_url: string | null;
  webhook_subscribed: boolean;
  is_active: boolean;
  connected_at: string;
}

export default function PagesPage() {
  const [pages, setPages] = useState<ConnectedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [form, setForm] = useState({ page_id: '', page_name: '', page_access_token: '' });

  const fetchPages = async () => {
    try {
      const res = await api.get('/pages');
      setPages(res.data.data || []);
    } catch {
      setPages([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const connectPage = async () => {
    if (!form.page_id || !form.page_name || !form.page_access_token) {
      toast.error('All fields are required');
      return;
    }
    try {
      await api.post('/pages/connect', form);
      toast.success('Page connected! 🎉');
      setShowConnect(false);
      setForm({ page_id: '', page_name: '', page_access_token: '' });
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const disconnectPage = async (id: string) => {
    if (!confirm('Disconnect this page? You will stop receiving messages.')) return;
    try {
      await api.delete(`/pages/${id}`);
      toast.success('Page disconnected');
      fetchPages();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Globe2 className="w-7 h-7 text-primary" /> Facebook Pages
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Connect your Facebook Pages to receive Messenger messages.</p>
        </div>
        <button onClick={() => setShowConnect(!showConnect)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Connect Page
        </button>
      </div>

      {/* Connect Form */}
      {showConnect && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-6 mb-6 space-y-4">
          <h3 className="font-heading font-semibold" style={{ color: 'var(--text-primary)' }}>Connect a Facebook Page</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Get your Page ID and Page Access Token from the Facebook Developer Console.
          </p>
          <input className="input-field" placeholder="Page ID (e.g., 123456789)" value={form.page_id} onChange={e => setForm({ ...form, page_id: e.target.value })} />
          <input className="input-field" placeholder="Page Name" value={form.page_name} onChange={e => setForm({ ...form, page_name: e.target.value })} />
          <input className="input-field" placeholder="Page Access Token" value={form.page_access_token} onChange={e => setForm({ ...form, page_access_token: e.target.value })} type="password" />
          <div className="flex gap-2">
            <button onClick={connectPage} className="btn-primary text-sm">Connect</button>
            <button onClick={() => setShowConnect(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Pages List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)
        ) : pages.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Globe2 className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No pages connected</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connect a Facebook Page to start receiving messages.</p>
          </div>
        ) : (
          pages.map((page, i) => (
            <motion.div key={page.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {page.page_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{page.page_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {page.page_id}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {page.webhook_subscribed && <span className="badge-success text-[10px] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Webhook Active</span>}
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Connected {new Date(page.connected_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => disconnectPage(page.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-danger/60 hover:text-danger">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
