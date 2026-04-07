'use client';

import { useState } from 'react';
import { Search, Download, Filter, MoreVertical, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { UserDetailPanel } from './UserDetailPanel';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Mock users
  const users = Array.from({ length: 25 }).map((_, i) => ({
    id: `usr_${i}`,
    full_name: `Test User ${i}`,
    email: `user${i}@example.com`,
    role: i === 0 ? 'super_admin' : (i < 3 ? 'admin' : 'user'),
    plan: i % 3 === 0 ? 'premium' : (i % 2 === 0 ? 'professional' : 'starter'),
    status: i === 4 ? 'suspended' : 'active',
    joined: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    last_active: '2 hours ago',
    tasks_month: Math.floor(Math.random() * 5000),
  }));

  const columns = [
    {
      header: 'User',
      accessorKey: 'full_name',
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
            {info.getValue().charAt(0)}
          </div>
          <div>
            <div className="font-medium text-white">{info.getValue()}</div>
            <div className="text-xs text-dark-500">{info.row.original.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: (info: any) => (
        <span className={`badge ${info.getValue() === 'user' ? 'bg-white/10 text-dark-400' : 'bg-primary/20 text-primary'} capitalize text-[10px]`}>
          {info.getValue().replace('_', ' ')}
        </span>
      )
    },
    {
      header: 'Plan',
      accessorKey: 'plan',
      cell: (info: any) => {
        let colors = 'bg-white/10 text-dark-400';
        if (info.getValue() === 'starter') colors = 'bg-cyan-500/20 text-cyan-400';
        if (info.getValue() === 'professional') colors = 'bg-violet-500/20 text-violet-400';
        if (info.getValue() === 'premium') colors = 'bg-emerald-500/20 text-emerald-400';
        return <span className={`badge ${colors} capitalize text-[10px] w-20 justify-center`}>{info.getValue()}</span>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <span className={info.getValue() === 'active' ? 'badge-success' : 'badge-danger'}>{info.getValue()}</span>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'joined',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
    {
      header: 'Last Active',
      accessorKey: 'last_active'
    },
    {
      header: 'Tasks (mo)',
      accessorKey: 'tasks_month',
      cell: (info: any) => <div className="font-mono text-xs">{info.getValue()}</div>
    },
    {
      header: '',
      id: 'actions',
      cell: (info: any) => (
        <div className="flex justify-end">
          <button 
            onClick={() => setSelectedUserId(info.row.original.id)}
            className="p-2 hover:bg-white/10 rounded-lg text-dark-500 hover:text-white transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto pb-24 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">User Management</h1>
        <p className="text-dark-500">Manage platform users, roles, and view detailed agent usage.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => toast.success('Export started')} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 border-primary/30 text-primary-300 hover:text-primary hover:border-primary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable 
          columns={columns} 
          data={users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))} 
          pageCount={2}
          pageSize={15}
        />
      </div>

      <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}
