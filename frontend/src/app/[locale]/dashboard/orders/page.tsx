'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Filter, Eye, ChevronDown, CheckCircle2, 
  MapPin, Phone, CreditCard, Truck, Calendar, 
  ArrowRight, Search, Zap, Clock, X, Printer
} from 'lucide-react';
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
  payment_status: 'pending' | 'verified' | 'failed';
  delivery_status: 'pending' | 'booked' | 'in_transit' | 'delivered' | 'returned';
  tracking_number?: string | null;
  courier_name?: string | null;
  placed_by: 'ai' | 'manual';
  created_at: string;
}

const statusSteps = [
  { id: 'placed', label: 'Placed', icon: Clock },
  { id: 'paid', label: 'Paid', icon: CreditCard },
  { id: 'processing', label: 'Processing', icon: Zap },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
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
  }, [paymentFilter, deliveryFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getCurrentStepIndex = (order: Order) => {
    if (order.delivery_status === 'delivered') return 4;
    if (order.delivery_status === 'in_transit' || order.delivery_status === 'booked') return 3;
    if (order.payment_status === 'verified') return 2;
    if (order.payment_status === 'pending' || order.payment_status === 'verified') return 1;
    return 0;
  };

  const updateOrder = async (id: string, updates: any) => {
    try {
      await api.put(`/orders/${id}`, updates);
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch { toast.error('Failed to update'); }
  };

  const dispatchToCourier = async (order: Order) => {
    toast.loading('🚚 AI is booking delivery...', { id: 'courier-dispatch' });
    try {
      await api.post('/agents/order/run', {
        order_id: order.id,
        payment_method: order.payment_method || 'bkash',
        trx_id: order.payment_trx_id || `TRX${Math.floor(Math.random() * 1000000)}`,
        amount: order.total_amount,
        customer_phone: order.customer_phone || '',
        customer_address: order.customer_address || 'Dhaka, Bangladesh',
      });
      toast.success('Order dispatched to courier!', { id: 'courier-dispatch' });
      setSelectedOrder(null);
      setTimeout(fetchOrders, 3000);
    } catch (err: any) {
      toast.error('Failed to dispatch to courier', { id: 'courier-dispatch' });
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.includes(searchQuery)
  );

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-1 flex items-center gap-3">
             <ShoppingBag className="w-8 h-8 text-primary" /> Order Management
          </h1>
          <p className="text-dark-500 text-sm">{orders.length} total orders processed</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="glass-card px-4 py-2 text-sm text-white flex items-center gap-2 hover:bg-white/10 transition-all">
             <Printer className="w-4 h-4 text-dark-500" /> Bulk Invoices
           </button>
           <button onClick={fetchOrders} className="btn-primary flex items-center gap-2">
             <Zap className="w-4 h-4" /> Refresh Data
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input 
            type="text" 
            placeholder="Search by ID or customer name..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-3 relative">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
           <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-8 text-sm text-white appearance-none focus:outline-none focus:border-primary/50" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
             <option value="">All Payments</option>
             <option value="pending">Pending</option>
             <option value="verified">Verified</option>
             <option value="failed">Failed</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
        </div>
        <div className="md:col-span-3 relative">
           <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 pr-8 text-sm text-white appearance-none focus:outline-none focus:border-primary/50" value={deliveryFilter} onChange={e => setDeliveryFilter(e.target.value)}>
             <option value="">All Deliveries</option>
             <option value="pending">Pending</option>
             <option value="booked">Booked</option>
             <option value="in_transit">In Transit</option>
             <option value="delivered">Delivered</option>
           </select>
           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-white/5 bg-white/5">
              <tr>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Order ID</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Customer</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Total</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Payment</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Delivery</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-6 py-4 font-bold text-dark-400 uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={7} className="px-6 py-4"><div className="skeleton h-10 w-full rounded-lg" /></td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-dark-500 italic">No orders matching your criteria...</td></tr>
              ) : (
                filteredOrders.map((o, i) => (
                  <motion.tr 
                    key={o.id} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-[11px] text-white">#XENI-{o.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">{(o.customer_name || 'C').charAt(0)}</div>
                         <div>
                            <p className="text-white font-medium">{o.customer_name || 'Guest'}</p>
                            <p className="text-[10px] text-dark-500">{o.customer_phone}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">৳{o.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                         o.payment_status === 'verified' ? 'bg-success/10 text-success border-success/20' : 
                         o.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                         'bg-danger/10 text-danger border-danger/20'
                       }`}>
                         {o.payment_status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                         o.delivery_status === 'delivered' ? 'bg-success/10 text-success border-success/20' : 
                         o.delivery_status === 'pending' ? 'bg-dark-500/10 text-dark-400 border-white/5' : 
                         'bg-primary/10 text-primary border-primary/20'
                       }`}>
                         {o.delivery_status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-dark-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => setSelectedOrder(o)} className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                         <Eye className="w-4 h-4" />
                       </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setSelectedOrder(null)} 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
               <div>
                  <h2 className="text-xl font-heading font-bold text-white">Order Details</h2>
                  <p className="text-[10px] text-dark-500 font-mono mt-1">#XENI-{selectedOrder.id}</p>
               </div>
               <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-white/10 text-dark-500 hover:text-white transition-all">
                 <X className="w-5 h-5" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               {/* Visual Stepper */}
               <div className="relative pt-4 pb-8">
                  <div className="absolute top-[38px] left-[10%] right-[10%] h-0.5 bg-white/5" />
                  <div className="absolute top-[38px] left-[10%] h-0.5 bg-primary transition-all duration-1000" 
                       style={{ width: `${(getCurrentStepIndex(selectedOrder) / 4) * 80}%` }} />
                  
                  <div className="flex justify-between relative">
                     {statusSteps.map((step, idx) => {
                       const active = idx <= getCurrentStepIndex(selectedOrder);
                       return (
                         <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                              active ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-900 border-white/10 text-dark-500'
                            }`}>
                               <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-dark-500'}`}>{step.label}</span>
                         </div>
                       );
                     })}
                  </div>
               </div>

               {/* Two Column Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                       <User className="w-4 h-4" /> Customer Info
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-white/5 text-dark-500"><Phone className="w-4 h-4" /></div>
                           <div>
                              <p className="text-[10px] text-dark-500 font-bold uppercase">Phone Number</p>
                              <p className="text-sm text-white">{selectedOrder.customer_phone}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-white/5 text-dark-500"><MapPin className="w-4 h-4" /></div>
                           <div>
                              <p className="text-[10px] text-dark-500 font-bold uppercase">Shipping Address</p>
                              <p className="text-sm text-white">{selectedOrder.customer_address || 'Not provided'}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
                       <DollarSign className="w-4 h-4" /> Payment & Billing
                     </h3>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="p-2.5 rounded-xl bg-white/5 text-dark-500"><CreditCard className="w-4 h-4" /></div>
                           <div>
                              <p className="text-[10px] text-dark-500 font-bold uppercase">Method & Amount</p>
                              <p className="text-sm text-white"><span className="uppercase">{selectedOrder.payment_method}</span> — <span className="font-bold">৳{selectedOrder.total_amount.toLocaleString()}</span></p>
                           </div>
                        </div>
                        {selectedOrder.payment_trx_id && (
                          <div className="flex items-center gap-4">
                             <div className="p-2.5 rounded-xl bg-white/5 text-dark-500"><Zap className="w-4 h-4" /></div>
                             <div>
                                <p className="text-[10px] text-dark-500 font-bold uppercase">Transaction ID</p>
                                <p className="text-sm text-white font-mono">{selectedOrder.payment_trx_id}</p>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Items Placeholder */}
               <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h4 className="text-xs font-bold text-white mb-4">Ordered Items</h4>
                  <div className="flex items-center justify-between py-2 border-b border-white/5 opacity-50">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-500/20" />
                        <span className="text-sm">Premium Product (Sample)</span>
                     </div>
                     <span className="text-sm font-bold text-white">৳{selectedOrder.total_amount}</span>
                  </div>
               </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col md:flex-row gap-4">
               {selectedOrder.delivery_status === 'pending' ? (
                 <button 
                  onClick={() => dispatchToCourier(selectedOrder)}
                  className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
                 >
                   <Truck className="w-5 h-5" /> Dispatch via AI Agent
                 </button>
               ) : (
                 <div className="flex-1 flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-xs text-success font-bold">Successfully Booked with {selectedOrder.courier_name}</span>
                 </div>
               )}
               <div className="flex gap-2">
                 {selectedOrder.payment_status === 'pending' && (
                   <button onClick={() => updateOrder(selectedOrder.id, { payment_status: 'verified' })} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 flex items-center gap-2">
                     <CreditCard className="w-4 h-4" /> Verify Manually
                   </button>
                 )}
                 <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10">
                   Print Invoice
                 </button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}

