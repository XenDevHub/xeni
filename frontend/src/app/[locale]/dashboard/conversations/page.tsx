'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Bot, User, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  customer_psid: string;
  customer_name: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  handling_mode: string;
  status: string;
}

interface Message {
  id: string;
  direction: string;
  sender_type: string;
  content_type: string;
  content_text: string | null;
  sent_at: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations', { params: { per_page: 50 } });
      setConversations(res.data.data || []);
    } catch {
      // Demo data for when API is not available
      setConversations([
        { id: '1', customer_psid: '123', customer_name: 'রহিম আহমেদ', last_message_preview: 'টি-শার্টের দাম কত?', last_message_at: new Date().toISOString(), unread_count: 2, handling_mode: 'ai', status: 'open' },
        { id: '2', customer_psid: '456', customer_name: 'ফাতিমা বেগম', last_message_preview: 'আমার অর্ডারের স্ট্যাটাস জানতে চাই', last_message_at: new Date(Date.now() - 3600000).toISOString(), unread_count: 0, handling_mode: 'human', status: 'open' },
        { id: '3', customer_psid: '789', customer_name: 'করিম সরকার', last_message_preview: 'ধন্যবাদ, প্রোডাক্ট পেয়েছি', last_message_at: new Date(Date.now() - 7200000).toISOString(), unread_count: 0, handling_mode: 'ai', status: 'resolved' },
      ]);
    }
    setLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    setSelected(conv);
    try {
      const res = await api.get(`/conversations/${conv.id}/messages`);
      setMessages((res.data.data?.messages || []).reverse());
    } catch {
      setMessages([
        { id: '1', direction: 'inbound', sender_type: 'customer', content_type: 'text', content_text: conv.last_message_preview, sent_at: new Date().toISOString() },
        { id: '2', direction: 'outbound', sender_type: 'ai', content_type: 'text', content_text: 'আসসালামু আলাইকুম! 🌟 কিভাবে সাহায্য করতে পারি?', sent_at: new Date().toISOString() },
      ]);
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/conversations/${selected.id}/messages`, { text: reply });
      setMessages(prev => [...prev, { id: Date.now().toString(), direction: 'outbound', sender_type: 'human', content_type: 'text', content_text: reply, sent_at: new Date().toISOString() }]);
      setReply('');
      toast.success('Message sent');
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), direction: 'outbound', sender_type: 'human', content_type: 'text', content_text: reply, sent_at: new Date().toISOString() }]);
      setReply('');
    }
    setSending(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const toggleMode = async (conv: Conversation) => {
    const newMode = conv.handling_mode === 'ai' ? 'human' : 'ai';
    try {
      await api.put(`/conversations/${conv.id}/mode`, { mode: newMode });
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, handling_mode: newMode } : c));
      if (selected?.id === conv.id) setSelected({ ...conv, handling_mode: newMode });
      toast.success(`Switched to ${newMode === 'ai' ? 'AI' : 'Human'} mode`);
    } catch {
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, handling_mode: newMode } : c));
      if (selected?.id === conv.id) setSelected({ ...conv, handling_mode: newMode });
    }
  };

  const timeAgo = (date: string) => {
    const d = (Date.now() - new Date(date).getTime()) / 60000;
    if (d < 1) return 'now';
    if (d < 60) return `${Math.floor(d)}m`;
    if (d < 1440) return `${Math.floor(d / 60)}h`;
    return `${Math.floor(d / 1440)}d`;
  };

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className="w-[320px] border-r flex flex-col shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-heading font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <MessageCircle className="w-5 h-5 text-primary" /> Inbox
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{conversations.filter(c => c.status === 'open').length} open</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-4 py-3"><div className="skeleton h-12 w-full" /></div>)
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left px-4 py-3 border-b transition-colors ${selected?.id === conv.id ? 'bg-primary/10' : 'hover:bg-white/5'}`}
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(conv.customer_name || 'C').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{conv.customer_name || `PSID ${conv.customer_psid}`}</p>
                      <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>{conv.last_message_at ? timeAgo(conv.last_message_at) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{conv.last_message_preview || 'No messages'}</p>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-2">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{selected.customer_name || `PSID ${selected.customer_psid}`}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PSID: {selected.customer_psid}</p>
              </div>
              <button onClick={() => toggleMode(selected)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors" style={{ background: 'var(--bg-card)', color: selected.handling_mode === 'ai' ? '#a78bfa' : '#60a5fa' }}>
                {selected.handling_mode === 'ai' ? <><Bot className="w-3.5 h-3.5" /> AI Mode</> : <><User className="w-3.5 h-3.5" /> Human Mode</>}
                {selected.handling_mode === 'ai' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.direction === 'outbound'
                      ? msg.sender_type === 'ai' ? 'bg-violet-600/20 text-violet-200 rounded-br-sm' : 'bg-primary/20 text-primary rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`} style={msg.direction === 'inbound' ? { background: 'var(--bg-card)', color: 'var(--text-primary)' } : undefined}>
                    {msg.sender_type === 'ai' && msg.direction === 'outbound' && <p className="text-[10px] text-violet-400 mb-1 flex items-center gap-1"><Bot className="w-3 h-3" /> AI Response</p>}
                    <p>{msg.content_text}</p>
                    <p className="text-[10px] mt-1 opacity-50">{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="px-6 py-3 border-t flex gap-2" style={{ borderColor: 'var(--border-color)' }}>
              <input
                className="input-field flex-1"
                placeholder="Type a message..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={sending || !reply.trim()} className="btn-primary px-4">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Select a conversation</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Choose from the inbox on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
