'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter, Eye, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address?: string | null;
  total_amount: number;
  payment_method: string | null;
  payment_trx_id?: string | null;
  payment_status: string;
  delivery_status: string;
  placed_by: string;
  created_at: string;
}

const paymentBadge = (s: string) => {
  switch (s) {
    case 'verified': return 'badge-success';
    case 'pending': return 'badge-warning';
    case 'failed': return 'badge-danger';
    default: return 'badge';
  }
};

const deliveryBadge = (s: string) => {
  switch (s) {
    case 'delivered': return 'badge-success';
    case 'in_transit': case 'booked': return 'badge-warning';
    case 'returned': return 'badge-danger';
    default: return 'badge';
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const params: any = { per_page: 50 };
      if (paymentFilter) params.payment_status = paymentFilter;
      if (deliveryFilter) params.delivery_status = deliveryFilter;
      const res = await api.get('/orders', { params });
      setOrders(res.data.data || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [paymentFilter, deliveryFilter]);

  const updateOrder = async (id: string, updates: any) => {
    try {
      await api.put(`/orders/${id}`, updates);
      toast.success('Order updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch { toast.error('Failed to update'); }
  };

  const processOrderViaAI = async (order: Order) => {
    toast.loading('AI Agent verifying payment & courier...', { id: 'ai-order' });
    try {
      await api.post('/agents/run', {
        agent_type: 'order',
        input: {
          order_id: order.id,
          payment_method: order.payment_method || 'bkash',
          trx_id: order.payment_trx_id || `TRX${Math.floor(Math.random() * 1000000)}`,
          amount: order.total_amount,
          customer_phone: order.customer_phone || '',
          customer_address: order.customer_address || 'Dhaka, Bangladesh'
        }
      });
      toast.success('Dispatched to Order Agent!', { id: 'ai-order' });
      setSelectedOrder(null);
      setTimeout(fetchOrders, 3600); // refresh after python worker completes
    } catch {
      toast.error('Failed to trigger AI', { id: 'ai-order' });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <ShoppingBag className="w-7 h-7 text-primary" /> Orders
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <select className="input-field pl-9 pr-8 text-sm min-w-[160px] appearance-none" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="relative">
          <select className="input-field pr-8 text-sm min-w-[160px] appearance-none" value={deliveryFilter} onChange={e => setDeliveryFilter(e.target.value)}>
            <option value="">All Delivery</option>
            <option value="pending">Pending</option>
            <option value="booked">Booked</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Customer</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Amount</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Payment</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Delivery</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Source</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No orders yet.</td></tr>
              ) : (
                orders.map((o, i) => (
                  <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{o.customer_name || 'Unknown'}</p>
                      {o.customer_phone && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.customer_phone}</p>}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>৳{o.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={paymentBadge(o.payment_status)}>{o.payment_status}</span></td>
                    <td className="px-4 py-3"><span className={deliveryBadge(o.delivery_status)}>{o.delivery_status.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3">
                      <span className={`badge ${o.placed_by === 'ai' ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'}`}>
                        {o.placed_by === 'ai' ? '🤖 AI' : '👤 Manual'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--text-primary)' }}>Order Details</h2>
            <div className="space-y-2 text-sm">
              <p><span style={{ color: 'var(--text-muted)' }}>Customer:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedOrder.customer_name || 'Unknown'}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <span className="font-bold" style={{ color: 'var(--text-primary)' }}>৳{selectedOrder.total_amount.toLocaleString()}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Payment:</span> <span className={paymentBadge(selectedOrder.payment_status)}>{selectedOrder.payment_status}</span></p>
              <p><span style={{ color: 'var(--text-muted)' }}>Delivery:</span> <span className={deliveryBadge(selectedOrder.delivery_status)}>{selectedOrder.delivery_status}</span></p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {(selectedOrder.payment_status === 'pending' || selectedOrder.delivery_status === 'pending') && (
                <button 
                  onClick={() => processOrderViaAI(selectedOrder)} 
                  className="btn-primary flex items-center justify-center gap-2 text-sm w-full shadow-lg shadow-primary/20"
                >
                  <span className="text-xl">🤖</span> AI Auto-Process
                </button>
              )}
              <div className="flex gap-2">
                {selectedOrder.payment_status === 'pending' && (
                  <button onClick={() => updateOrder(selectedOrder.id, { payment_status: 'verified' })} className="btn-secondary text-sm flex-1 bg-white/5 hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>Manual Verify</button>
                )}
                {selectedOrder.delivery_status === 'pending' && selectedOrder.payment_status === 'verified' && (
                  <button onClick={() => updateOrder(selectedOrder.id, { delivery_status: 'booked' })} className="btn-secondary text-sm flex-1 bg-white/5 hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>Manual Book</button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
