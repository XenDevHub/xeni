'use client';

import { DataTable } from '@/components/admin/DataTable';
import { Search, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');

  const { data: trxData, isLoading } = useQuery({
    queryKey: ['admin-transactions', search],
    queryFn: async () => {
      const res = await api.get('/admin/transactions', { params: { search } });
      return res.data.data;
    }
  });

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'id',
      cell: (info: any) => <span className="font-mono text-[10px] text-primary-300 uppercase">{info.getValue().substring(0, 8)}...</span>
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (info: any) => {
        const user = info.getValue();
        return (
          <div>
            <div className="text-white font-medium">{user?.full_name || 'Anonymous'}</div>
            <div className="text-xs text-dark-500">{user?.email}</div>
          </div>
        );
      }
    },
    {
      header: 'Plan',
      accessorKey: 'plan',
      cell: (info: any) => <span className="badge bg-white/10 text-dark-400 capitalize">{info.getValue()?.name || 'N/A'}</span>
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-bold text-white">৳{info.getValue()?.toLocaleString()}</span>
    },
    {
      header: 'Gateway',
      accessorKey: 'gateway',
      cell: (info: any) => <span className="text-emerald-400 font-medium text-[10px] border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-400/10 uppercase">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <span className={info.getValue() === 'success' ? 'badge-success' : 'badge-danger'}>{info.getValue()}</span>
    },
    {
      header: 'Date',
      accessorKey: 'created_at',
      cell: (info: any) => <span className="text-dark-500 text-xs">{new Date(info.getValue()).toLocaleString()}</span>
    },
    {
      header: '',
      id: 'actions',
      cell: () => (
        <button className="p-2 hover:bg-white/10 rounded-lg text-dark-500 hover:text-white transition-colors" title="View Details">
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
          data={trxData || []} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
