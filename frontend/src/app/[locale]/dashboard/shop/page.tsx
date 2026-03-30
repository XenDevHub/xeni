'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Save, Truck, Smartphone } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Shop {
  id: string;
  shop_name: string;
  shop_description: string | null;
  shop_logo_url: string | null;
  preferred_language: string;
  courier_preference: string;
  bkash_merchant_number: string | null;
  nagad_merchant_number: string | null;
  auto_reply_enabled: boolean;
  auto_order_enabled: boolean;
}

export default function ShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    shop_name: '',
    shop_description: '',
    preferred_language: 'bn',
    courier_preference: 'pathao',
    bkash_merchant_number: '',
    nagad_merchant_number: '',
    auto_reply_enabled: true,
    auto_order_enabled: true,
  });

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await api.get('/shops/me');
        const s = res.data.data;
        setShop(s);
        setForm({
          shop_name: s.shop_name || '',
          shop_description: s.shop_description || '',
          preferred_language: s.preferred_language || 'bn',
          courier_preference: s.courier_preference || 'pathao',
          bkash_merchant_number: s.bkash_merchant_number || '',
          nagad_merchant_number: s.nagad_merchant_number || '',
          auto_reply_enabled: s.auto_reply_enabled ?? true,
          auto_order_enabled: s.auto_order_enabled ?? true,
        });
      } catch {
        setIsNew(true);
      }
      setLoading(false);
    }
    fetchShop();
  }, []);

  const handleSave = async () => {
    if (!form.shop_name.trim()) {
      toast.error('Shop name is required');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/shops', form);
        setShop(res.data.data);
        setIsNew(false);
        toast.success('Shop created! 🎉');
      } else {
        const res = await api.put('/shops/me', form);
        setShop(res.data.data);
        toast.success('Shop updated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8"><div className="skeleton w-full h-96" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Store className="w-7 h-7 text-primary" />
          {isNew ? 'Set Up Your Shop' : 'Shop Settings'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          {isNew ? 'Create your shop to start selling on Messenger.' : 'Manage your shop configuration.'}
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Shop Name *</label>
          <input
            className="input-field"
            placeholder="e.g., Trendy Fashion BD"
            value={form.shop_name}
            onChange={e => setForm({ ...form, shop_name: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Description</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            placeholder="Describe your shop..."
            value={form.shop_description}
            onChange={e => setForm({ ...form, shop_description: e.target.value })}
          />
        </div>

        {/* Language & Courier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Language</label>
            <select className="input-field" value={form.preferred_language} onChange={e => setForm({ ...form, preferred_language: e.target.value })}>
              <option value="bn">বাংলা (Bangla)</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Truck className="w-4 h-4" /> Courier
            </label>
            <select className="input-field" value={form.courier_preference} onChange={e => setForm({ ...form, courier_preference: e.target.value })}>
              <option value="pathao">Pathao</option>
              <option value="steadfast">Steadfast</option>
            </select>
          </div>
        </div>

        {/* MFS Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Smartphone className="w-4 h-4" /> bKash Number
            </label>
            <input className="input-field" placeholder="01XXXXXXXXX" value={form.bkash_merchant_number} onChange={e => setForm({ ...form, bkash_merchant_number: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Smartphone className="w-4 h-4" /> Nagad Number
            </label>
            <input className="input-field" placeholder="01XXXXXXXXX" value={form.nagad_merchant_number} onChange={e => setForm({ ...form, nagad_merchant_number: e.target.value })} />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Reply (AI Conversation)</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Let AI respond to Messenger messages automatically</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${form.auto_reply_enabled ? 'bg-primary' : 'bg-gray-600'}`} onClick={() => setForm({ ...form, auto_reply_enabled: !form.auto_reply_enabled })}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.auto_reply_enabled ? 'translate-x-5' : ''}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Auto-Order Processing</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Automatically verify payments and book couriers</p>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${form.auto_order_enabled ? 'bg-primary' : 'bg-gray-600'}`} onClick={() => setForm({ ...form, auto_order_enabled: !form.auto_order_enabled })}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.auto_order_enabled ? 'translate-x-5' : ''}`} />
            </div>
          </label>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : isNew ? 'Create Shop' : 'Save Changes'}
        </button>
      </motion.div>
    </div>
  );
}
