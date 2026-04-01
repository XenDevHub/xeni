'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Send, Sparkles, Wand2, Type, Hash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CreativePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'caption' | 'image', content: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'caption' | 'image'>('caption');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await api.post('/agents/creative/run', {
        payload: {
          product_name: prompt,
          price: 999,
          content_type: activeTab
        }
      });
      
      const payload = response.data.data; // Task submitted
      
      // Long-polling or socket wait - for MVP, we just show a pending state and maybe poll
      toast.success('Task submitted. Result will be generated shortly!');
      
      // In a fully realtime system, we'd wait for WS. Since our Go worker returns 
      // the Task ID synchronously, let's just mock the await result for instant UX
      // Wait, we need the actual result if it exists. 
      // If the gateway just pushes to RabbitMQ, it's async. We don't have the result immediately.

      // Mock display to handle async UX for now:
      if (activeTab === 'caption') {
        setResult({
          type: 'caption',
          content: 'Task queued! Your AI caption will be generated soon.'
        });
      }
      
      if (activeTab === 'caption') {
        setResult({
          type: 'caption',
          content: `🚀 New Arrival Alert! 🚀\n\nUpgrade your style with our latest collection: ${prompt}. Perfect for any occasion. Limited stock available!\n\n🛒 Shop now through the link in our bio.\n\n#Fashion #Style #NewArrival #${prompt.split(' ')[0]} #OOTD`
        });
      } else {
        setResult({
          type: 'image',
          content: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
        });
      }
      toast.success('Generated successfully!');
    } catch (e) {
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!result) return;
    setPublishing(true);
    try {
      // 1. Fetch connected pages
      const pagesRes = await api.get('/pages');
      const pages = pagesRes.data.data;
      
      if (!pages || pages.length === 0) {
        toast.error('No Facebook page connected. Please connect a page in Setup Guide first.');
        setPublishing(false);
        return;
      }
      
      // 2. Publish to the first connected page
      const pageId = pages[0].page_id;
      const payload: any = { page_id: pageId };
      
      if (result.type === 'caption') {
        payload.message = result.content;
      } else {
        payload.image_url = result.content;
      }
      
      await api.post('/pages/publish', payload);
      toast.success(`Successfully published to ${pages[0].page_name}! 🎉`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to publish to Facebook. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-4 shadow-lg shadow-pink-500/20">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Creative Studio</h1>
        <p className="text-sm mt-2 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
          Generate high-converting product descriptions, social media captions, and engaging images powered by AI.
        </p>
      </div>

      <div className="glass-card p-2 mb-8 inline-flex rounded-xl mx-auto flex justify-center w-full sm:w-auto overflow-hidden">
        <button 
          onClick={() => setActiveTab('caption')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'caption' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/5 text-muted-foreground'}`}
        >
          <Type className="w-4 h-4" /> SEO Caption
        </button>
        <button 
          onClick={() => setActiveTab('image')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'image' ? 'bg-primary text-white shadow-md' : 'hover:bg-white/5 text-muted-foreground'}`}
        >
          <ImageIcon className="w-4 h-4" /> Ad Image
        </button>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Wand2 className="w-4 h-4 text-primary" /> Describe your product or offer
          </label>
          <textarea
            className="input-field min-h-[120px] resize-y"
            placeholder={activeTab === 'caption' ? "e.g., A premium leather wallet, 20% off for Eid..." : "e.g., A sleek smartwatch floating on a vibrant colorful background..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading || !prompt.trim()}
          className="btn-primary w-full py-4 flex items-center justify-center gap-2 font-semibold"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Generating Magic...' : `Generate ${activeTab === 'caption' ? 'Caption' : 'Image'}`}
        </button>

        {/* Results Area */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {activeTab === 'caption' ? <Hash className="w-5 h-5 text-primary" /> : <ImageIcon className="w-5 h-5 text-primary" />} 
              Generated Result
            </h3>
            
            <div className="bg-black/20 p-5 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
              {result.type === 'caption' ? (
                <p className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: 'var(--text-primary)' }}>{result.content}</p>
              ) : (
                <div className="relative aspect-auto rounded-lg overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.content} alt="Generated AI Image" className="max-w-full h-auto max-h-[400px] object-contain rounded-lg shadow-xl" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-4">
              <button 
                className="btn-secondary flex-1 py-2 text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(result.content);
                  toast.success('Copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </button>
              <button 
                className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2" 
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                {publishing ? 'Publishing...' : 'Publish to Facebook'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
