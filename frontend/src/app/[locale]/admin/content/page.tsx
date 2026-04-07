'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Type, Users, Save, List, AlertCircle, MessageSquare, Star, CheckCircle, Ban, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'hero' | 'pricing' | 'reviews' | 'faq' | 'banner';

export default function ContentControlPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hero');

  const handleSave = () => toast.success('Content published to Landing Page!');

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto pb-24 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Content Control (CMS)</h1>
          <p className="text-dark-500">Changes made here are instantly reflected on the public landing page via ISR.</p>
        </div>
        <button onClick={handleSave} className="btn-primary py-2.5 flex items-center gap-2">
          <Save className="w-4 h-4" /> Publish Changes
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'hero', label: 'Hero Section', icon: Type },
          { id: 'pricing', label: 'Pricing Editor', icon: List },
          { id: 'reviews', label: 'Testimonials', icon: Users },
          { id: 'faq', label: 'FAQ', icon: MessageSquare },
          { id: 'banner', label: 'Announcements', icon: AlertCircle }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-glow' : 'bg-white/5 text-dark-500 hover:text-white hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full"
          >
            {activeTab === 'hero' && <HeroEditor />}
            {activeTab === 'pricing' && <PricingEditor />}
            {activeTab === 'reviews' && <ReviewsEditor />}
            {activeTab === 'faq' && <FAQEditor />}
            {activeTab === 'banner' && <BannerEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ------ Tab Components ------

function HeroEditor() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="glass-card p-6 space-y-6 overflow-y-auto">
        <div>
          <label className="text-sm font-medium text-dark-500 block mb-2">Announcement Badge (Top)</label>
          <input type="text" defaultValue="🚀 New: Steadfast Integration Live!" className="input-field" />
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">English Content</h4>
          <div>
            <label className="text-sm font-medium text-dark-500 block mb-2">Headline (EN)</label>
            <textarea className="input-field min-h-[80px]" defaultValue="Your Online Shop's Smart Assistant" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark-500 block mb-2">Subheadline (EN)</label>
            <textarea className="input-field min-h-[120px]" defaultValue="..." />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-primary-400">Bangla Content</h4>
          <div>
            <label className="text-sm font-medium text-dark-500 block mb-2">Headline (BN)</label>
            <textarea className="input-field min-h-[80px]" defaultValue="অনলাইন শপের জন্য স্মার্ট অ্যাসিস্ট্যান্ট" />
          </div>
        </div>
      </div>
      <div className="glass-card p-6 bg-black/40 border-dashed flex flex-col justify-center items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-50" />
        <div className="text-center z-10 relative">
          <p className="badge bg-primary/20 text-primary mb-6">🚀 New: Steadfast Integration Live!</p>
          <h1 className="text-4xl font-heading font-bold text-white mb-4">Your Online Shop's<br/><span className="text-primary-400">Smart Assistant</span></h1>
          <p className="text-dark-400 text-sm max-w-md mx-auto mb-8">Hi there! I'm Xeni, and I've been designed to take the 'busy work' off your plate.</p>
          <button className="btn-primary">Start Selling Smarter</button>
        </div>
      </div>
    </div>
  );
}

function PricingEditor() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full">
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading font-bold text-white">Starter Plan (Landing Page Display)</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-white/10 bg-dark w-4 h-4 text-primary" />
              <span className="text-xs text-dark-500">Visible</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-dark-500 mb-1 block">Display Name</label>
              <input type="text" defaultValue="Starter" className="input-field" />
            </div>
            <div>
              <label className="text-xs text-dark-500 mb-1 block">Tagline</label>
              <input type="text" defaultValue="Perfect for new sellers" className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-xs text-dark-500 mb-2 block">Feature Bullets</label>
            <textarea className="input-field font-mono text-sm min-h-[140px]" defaultValue="24/7 auto-reply in Bangla & English\nSmart intent detection\nProduct recommendation\nHuman handoff" />
            <p className="text-xs text-dark-600 mt-1">One feature per line.</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 glass-card p-8 bg-dark/80 relative">
        <div className="absolute top-4 right-4 badge bg-primary text-white text-xs">Live Preview</div>
        <div className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur mt-8">
          <h4 className="text-2xl font-bold font-heading text-white">Starter</h4>
          <p className="text-sm text-dark-500 mb-4">Perfect for new sellers</p>
          <div className="text-3xl font-bold text-white mb-6">৳2,500<span className="text-sm text-dark-500 font-normal">/mo</span></div>
          <button className="w-full btn-secondary mb-6">Get Started</button>
          <ul className="space-y-3">
            <li className="flex gap-2 text-sm text-dark-400"><CheckCircle className="w-4 h-4 text-primary shrink-0"/> 24/7 auto-reply in Bangla</li>
            <li className="flex gap-2 text-sm text-dark-400"><CheckCircle className="w-4 h-4 text-primary shrink-0"/> Smart intent detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ReviewsEditor() {
  const mockPending = [
    { id: 1, name: 'Rahim Store', text: 'This AI saved me 4 hours a day!', stars: 5, date: 'Today' }
  ];
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <div className="glass-card p-6">
        <h3 className="font-heading font-bold text-white mb-4">Pending Approval</h3>
        <div className="space-y-4">
          {mockPending.map(r => (
            <div key={r.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-white">{r.name}</div>
                <div className="flex text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" /><Star className="w-3 h-3 fill-amber-400" />
                </div>
              </div>
              <p className="text-sm text-dark-400 italic mb-4">"{r.text}"</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-success/20 hover:bg-success/30 text-success text-xs font-semibold py-2 rounded-xl transition-all">Approve</button>
                <button className="flex-1 bg-danger/20 hover:bg-danger/30 text-danger text-xs font-semibold py-2 rounded-xl transition-all">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="font-heading font-bold text-white mb-4">Live on Landing Page (Max 8)</h3>
        <div className="space-y-2">
          {[1,2,3].map(i => (
             <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-move">
               <GripVertical className="w-4 h-4 text-dark-600" />
               <div className="flex-1">
                 <div className="text-sm text-white font-medium">Boutique Owner {i}</div>
                 <div className="text-xs text-dark-500 truncate">"Amazing experience with Xeni..."</div>
               </div>
               <button className="text-danger/60 hover:text-danger"><Ban className="w-4 h-4"/></button>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQEditor() {
  return (
    <div className="glass-card p-6 h-full max-w-4xl">
      <h3 className="font-heading font-bold text-white mb-6">Frequently Asked Questions</h3>
      <button className="btn-secondary py-2 border-primary/30 text-primary hover:border-primary mb-6 w-full">+ Add New Question</button>
      <div className="space-y-4">
        {[1,2].map(i => (
          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
            <GripVertical className="w-5 h-5 text-dark-600 mt-2 cursor-move" />
            <div className="flex-1 space-y-4">
              <input type="text" defaultValue="Can it handle Facebook comments?" className="input-field text-sm font-bold" />
              <textarea defaultValue="Yes, it replies to both Messenger and comments." className="input-field text-sm min-h-[60px]" />
            </div>
            <button className="text-danger p-2 hover:bg-danger/10 rounded-lg transition-colors"><Ban className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerEditor() {
  return (
    <div className="glass-card p-6 h-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <label className="text-white font-medium">Show Announcement Banner</label>
        <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-dark-500 block mb-2">Banner Text (EN & BN mix accepted)</label>
        <input type="text" defaultValue="🎉 Special Eid Discount: 20% off all plans until next week!" className="input-field" />
      </div>

      <div>
        <label className="text-sm font-medium text-dark-500 block mb-2">Banner Color</label>
        <div className="flex gap-3">
          <button className="w-8 h-8 rounded-full bg-primary border-2 border-white" />
          <button className="w-8 h-8 rounded-full bg-cyan-500" />
          <button className="w-8 h-8 rounded-full bg-emerald-500" />
          <button className="w-8 h-8 rounded-full bg-danger" />
          <button className="w-8 h-8 rounded-full bg-amber-500" />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-dark-500 block mb-2">Auto-hide after (Expiry Date)</label>
        <input type="date" className="input-field max-w-[200px]" />
      </div>
    </div>
  );
}
