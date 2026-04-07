'use client';

import { DataTable } from '@/components/admin/DataTable';
import { Search, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Mock trans
const TRANSACTIONS = Array.from({length: 40}).map((_, i) => ({
  id: `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  user: `Shop Owner ${i}`,
  email: `shop${i}@brand.com`,
  plan: i % 3 === 0 ? 'premium' : 'professional',
  amount: i % 3 === 0 ? 25000 : 7500,
  gateway: 'SSLCommerz',
  status: i % 7 === 0 ? 'failed' : 'success',
  date: new Date(Date.now() - Math.random() * 1000000000).toISOString()
}));

export default function TransactionsPage() {
  const [search, setSearch] = useState('');

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'id',
      cell: (info: any) => <span className="font-mono text-xs text-primary-300">{info.getValue()}</span>
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (info: any) => (
        <div>
          <div className="text-white font-medium">{info.getValue()}</div>
          <div className="text-xs text-dark-500">{info.row.original.email}</div>
        </div>
      )
    },
    {
      header: 'Plan',
      accessorKey: 'plan',
      cell: (info: any) => <span className="badge bg-white/10 text-dark-400 capitalize">{info.getValue()}</span>
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-bold text-white">৳{info.getValue().toLocaleString()}</span>
    },
    {
      header: 'Gateway',
      accessorKey: 'gateway',
      cell: (info: any) => <span className="text-emerald-400 font-medium text-xs border border-emerald-400/30 px-2 py-1 rounded bg-emerald-400/10">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <span className={info.getValue() === 'success' ? 'badge-success' : 'badge-danger'}>{info.getValue()}</span>
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (info: any) => <span className="text-dark-500">{new Date(info.getValue()).toLocaleString()}</span>
    },
    {
      header: '',
      id: 'actions',
      cell: () => (
        <button className="p-2 hover:bg-white/10 rounded-lg text-dark-500 hover:text-white transition-colors" title="View Payload JSON">
          <ExternalLink className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto pb-24 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Transactions</h1>
        <p className="text-dark-500">Monitor platform subscription payments generated via SSLCommerz.</p>
      </div>

      <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="relative w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input 
            type="text" 
            placeholder="Search TrxID or User..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none"
          />
        </div>
        <button onClick={() => toast.success('Exporting...')} className="btn-secondary py-2 border-primary/30 text-primary-300 hover:border-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable 
          columns={columns} 
          data={TRANSACTIONS.filter(t => t.id.includes(search.toUpperCase()) || t.user.toLowerCase().includes(search.toLowerCase()))} 
          pageCount={3}
          pageSize={10}
        />
      </div>
    </div>
  );
}
