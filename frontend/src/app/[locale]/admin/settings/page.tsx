'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Globe, Bell, Save, Lock, Smartphone, Cloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System settings updated successfully');
    }, 1500);
  };

  return (
    <div className="p-8 space-y-6 max-w-[1200px] mx-auto pb-24 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">System Settings</h1>
          <p className="text-dark-500">Configure global platform parameters and infrastructure links.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="btn-primary py-2.5 px-6 flex items-center gap-2 shadow-glow"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          Save Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding & Identity */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white">Platform Branding</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">Site Name</label>
                <input type="text" defaultValue="Xeni AI" className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">Support Email</label>
                <input type="email" defaultValue="support@xeni.ai" className="input-field" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">Logo URL (Dark Mode)</label>
              <div className="flex gap-4">
                <input type="text" defaultValue="/logo-full.png" className="input-field flex-1" />
                <button className="btn-secondary px-4 text-xs">Preview</button>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section className="glass-card p-6 space-y-6">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Cloud className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-heading font-bold text-white">Cloud & API Services</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">DigitalOcean Space</label>
                <input type="text" defaultValue="xeni-assets-prod" className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-dark-500 uppercase tracking-wider">SSLCommerz Mode</label>
                <select className="input-field">
                   <option value="sandbox">Sandbox (Testing)</option>
                   <option value="live">Live (Production)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Status & Toggles */}
        <div className="space-y-8">
          <section className="glass-card p-6 space-y-6">
            <h3 className="font-heading font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Maintenance
            </h3>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">System Status</div>
                <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Operational</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">Public Registration</span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">Allow New Reviews</span>
                <div className="w-10 h-5 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300 opacity-50">Maintenance Mode</span>
                <div className="w-10 h-5 bg-dark-700 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-6 space-y-4">
             <h3 className="font-heading font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" /> Notifications
            </h3>
            <p className="text-xs text-dark-500">Global admin alerts for system failures or high revenue events.</p>
            <button className="w-full btn-secondary text-xs py-2">Test Email Ping</button>
          </section>
        </div>
      </div>
    </div>
  );
}
