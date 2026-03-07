'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import { QueueStats } from '@/types';

const REFRESH_INTERVAL = 3;

export default function AdminPage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi.getQueueStats();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch {
      setError('Could not reach purchase-service. Is it running on port 3002?');
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const pollTimer = setInterval(fetchStats, REFRESH_INTERVAL * 1000);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL : c - 1));
    }, 1000);

    return () => {
      clearInterval(pollTimer);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchStats]);

  const total =
    stats ? stats.queue.messagesAvailable + stats.queue.messagesInFlight + stats.queue.messagesDelayed : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SQS Queue Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Queue: <span className="font-mono font-medium text-indigo-600">order-created</span> &nbsp;·&nbsp;
            LocalStack :4566
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-600 font-medium">Refreshing in {countdown}s</span>
          </div>
          <button
            onClick={fetchStats}
            className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Refresh now
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Queue stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Available"
          value={stats?.queue.messagesAvailable ?? '—'}
          desc="Waiting to be consumed"
          color="indigo"
        />
        <StatCard
          label="In-Flight"
          value={stats?.queue.messagesInFlight ?? '—'}
          desc="Received, not yet deleted"
          color="amber"
        />
        <StatCard
          label="Delayed"
          value={stats?.queue.messagesDelayed ?? '—'}
          desc="Not yet visible"
          color="gray"
        />
      </div>

      {/* Flow diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Message Flow</h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <FlowNode label="Cart Service" sublabel=":3001" color="blue" />
          <Arrow label={`${stats?.queue.messagesAvailable ?? 0} msg`} />
          <FlowNode label="SQS Queue" sublabel="order-created" color="indigo" highlight />
          <Arrow label="polls every 5s" />
          <FlowNode label="Purchase Service" sublabel=":3002" color="emerald" />
          <Arrow label="writes" />
          <FlowNode label="purchase_db" sublabel="PostgreSQL" color="orange" />
        </div>

        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Queue depth</span>
              <span>{total} message{total !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(total * 10, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Purchase stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Purchase Records (purchase_db)</h2>
        <div className="grid grid-cols-3 gap-4">
          <MiniStat label="Total" value={stats?.purchases.total ?? '—'} />
          <MiniStat label="Pending" value={stats?.purchases.pending ?? '—'} color="amber" />
          <MiniStat label="Confirmed" value={stats?.purchases.confirmed ?? '—'} color="emerald" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  desc,
  color,
}: {
  label: string;
  value: number | string;
  desc: string;
  color: 'indigo' | 'amber' | 'gray';
}) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };
  const valueColors = {
    indigo: 'text-indigo-700',
    amber: 'text-amber-700',
    gray: 'text-gray-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-4xl font-bold mb-1 ${valueColors[color]}`}>{value}</p>
      <p className="text-xs opacity-70">{desc}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: 'amber' | 'emerald';
}) {
  const valueColor = color === 'amber'
    ? 'text-amber-600'
    : color === 'emerald'
    ? 'text-emerald-600'
    : 'text-gray-800';

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function FlowNode({
  label,
  sublabel,
  color,
  highlight,
}: {
  label: string;
  sublabel: string;
  color: string;
  highlight?: boolean;
}) {
  const borders: Record<string, string> = {
    blue: 'border-blue-300 bg-blue-50',
    indigo: 'border-indigo-400 bg-indigo-50',
    emerald: 'border-emerald-300 bg-emerald-50',
    orange: 'border-orange-300 bg-orange-50',
  };

  return (
    <div
      className={`rounded-lg border-2 px-4 py-2 text-center min-w-[110px] ${borders[color] ?? 'border-gray-300 bg-gray-50'} ${highlight ? 'shadow-md ring-2 ring-indigo-300' : ''}`}
    >
      <p className="text-xs font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-500 font-mono">{sublabel}</p>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-gray-400 text-lg leading-none">→</span>
    </div>
  );
}
