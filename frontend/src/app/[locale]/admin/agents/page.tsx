'use client';

import { StatCard } from '@/components/admin/StatCard';
import { Bot, MessageSquare, ShoppingBag, Box, Palette, LineChart } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';

const FAILURES = [
  { id: 'tsk_102', agent: 'Creative', error: 'OpenAI API Timeout. Retries exhausted.', time: '10 mins ago', status: 'DLQ' },
  { id: 'tsk_104', agent: 'Inventory', error: 'Database constraint violation on stock update.', time: '1 hour ago', status: 'DLQ' },
  { id: 'tsk_109', agent: 'Order', error: 'Pathao API unreachable (502 Gateway).', time: '2 hours ago', status: 'DLQ' },
];

export default function AgentUsagePage() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto pb-24 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Agent Performance</h1>
        <p className="text-dark-500">Monitor utilization, success rates, and errors across the 5 specialized agents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Front Desk" value={45200} icon={MessageSquare} color="text-cyan-400" change={{value: '99.9%', isPositive: true}} />
        <StatCard label="Ops Lead" value={12400} icon={ShoppingBag} color="text-emerald-400" change={{value: '99.5%', isPositive: true}} />
        <StatCard label="Inventory" value={89200} icon={Box} color="text-violet-400" change={{value: '100%', isPositive: true}} />
        <StatCard label="Creative" value={3200} icon={Palette} color="text-pink-400" change={{value: '94.2%', isPositive: false}} />
        <StatCard label="Intelligence" value={1500} icon={LineChart} color="text-amber-400" change={{value: '98.1%', isPositive: true}} />
      </div>

      <div className="glass-card p-6 border border-danger/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-danger flex items-center gap-2">
             Dead-Letter Queue (Failed Tasks)
          </h3>
          <button className="btn-secondary py-1.5 text-xs text-white border-white/20">Bulk Retry All</button>
        </div>
        
        <DataTable 
          columns={[
            { header: 'Task ID', accessorKey: 'id', cell: (info: any) => <span className="font-mono text-xs">{info.getValue()}</span> },
            { header: 'Agent', accessorKey: 'agent', cell: (info: any) => <span className="badge bg-white/10">{info.getValue()}</span> },
            { header: 'Error Log', accessorKey: 'error', cell: (info: any) => <span className="text-danger/80 text-sm font-mono">{info.getValue()}</span> },
            { header: 'Time', accessorKey: 'time', cell: (info: any) => <span className="text-dark-500">{info.getValue()}</span> },
            { header: '', id: 'actions', cell: () => <button className="text-primary-400 hover:text-white text-xs">Retry Task</button> }
          ]} 
          data={FAILURES} 
        />
      </div>
    </div>
  );
}
