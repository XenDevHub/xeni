'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  name_bn: string | null;
  price: number;
  sku: string | null;
  current_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_out_of_stock: boolean;
  images: string[];
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', name_bn: '', price: 0, sku: '', initial_stock: 0, low_stock_threshold: 5, images: [] as string[] });
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { search, per_page: 50 } });
      setProducts(res.data.data || []);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', name_bn: '', price: 0, sku: '', initial_stock: 0, low_stock_threshold: 5, images: [] });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, name_bn: p.name_bn || '', price: p.price, sku: p.sku || '', initial_stock: p.current_stock, low_stock_threshold: p.low_stock_threshold, images: p.images || [] });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(prev => ({ ...prev, images: [...prev.images, res.data.data.url] }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, { name: form.name, name_bn: form.name_bn || null, price: form.price, sku: form.sku || null, current_stock: form.initial_stock, low_stock_threshold: form.low_stock_threshold, images: form.images });
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product created! 🎉');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const runAIAudit = async () => {
    toast.loading('AI is analyzing your inventory...', { id: 'ai-inventory' });
    try {
      await api.post('/agents/run', {
        agent_type: 'inventory',
        input: {
          shop_id: 'auto-resolved-by-backend',
          products: products.map(p => ({
            name: p.name,
            sku: p.sku,
            price: p.price,
            current_stock: p.current_stock,
            low_stock_threshold: p.low_stock_threshold
          }))
        }
      });
      toast.success('Inventory Audit dispatched! Check dashboard later.', { id: 'ai-inventory' });
    } catch {
      toast.error('Failed to trigger AI', { id: 'ai-inventory' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <Package className="w-7 h-7 text-primary" /> Products
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{products.length} products</p>
        </div>
        <div className="flex gap-2">
          <button onClick={runAIAudit} className="btn-secondary flex items-center gap-2 text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <span className="text-lg">🤖</span> AI Audit
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field pl-10" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Product</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Price</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Stock</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-right px-4 py-3 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="skeleton h-8 w-full" /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No products yet. Add your first product!</td></tr>
              ) : (
                products.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b last:border-0 hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        {p.name_bn && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.name_bn}</p>}
                        {p.sku && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>SKU: {p.sku}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>৳{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--text-primary)' }}>{p.current_stock}</span>
                        {p.current_stock <= p.low_stock_threshold && p.current_stock > 0 && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_out_of_stock ? <span className="badge-danger">Out of Stock</span> :
                       p.current_stock <= p.low_stock_threshold ? <span className="badge-warning">Low Stock</span> :
                       <span className="badge-success">In Stock</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Edit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors text-danger/60 hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="glass-card p-6 w-full max-w-md space-y-4" style={{ background: 'var(--bg-secondary)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
              </div>
              <input className="input-field" placeholder="Product name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input-field" placeholder="নাম (বাংলা)" value={form.name_bn} onChange={e => setForm({ ...form, name_bn: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="number" placeholder="Price (৳)" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                <input className="input-field" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="number" placeholder="Stock" value={form.initial_stock || ''} onChange={e => setForm({ ...form, initial_stock: Number(e.target.value) })} />
                <input className="input-field" type="number" placeholder="Low stock at" value={form.low_stock_threshold || ''} onChange={e => setForm({ ...form, low_stock_threshold: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Product Images</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {form.images.map((img, idx) => (
                     <img key={idx} src={img} alt="Product preview" className="w-16 h-16 object-cover rounded-lg shadow-sm border" style={{ borderColor: 'var(--border-color)' }} />
                  ))}
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" style={{ color: 'var(--text-muted)' }} />
                {uploading && <span className="text-xs text-primary animate-pulse w-full block mt-1">Uploading image to DigitalOcean Spaces...</span>}
              </div>
              <button onClick={handleSave} className="btn-primary w-full">{editing ? 'Save Changes' : 'Create Product'}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
