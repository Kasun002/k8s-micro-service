'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import { DailySalesReport, QueueStats } from '@/types';

const REFRESH_INTERVAL = 3;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function AdminPage() {
  // ── Queue monitor ──────────────────────────────────────────────
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi.getQueueStats();
      setStats(data);
      setQueueError(null);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch {
      setQueueError('Could not reach purchase-service. Is it running on port 3002?');
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

  const total = stats
    ? stats.queue.messagesAvailable + stats.queue.messagesInFlight + stats.queue.messagesDelayed
    : 0;

  // ── Daily sales report ─────────────────────────────────────────
  const [reportDate, setReportDate] = useState(todayISO());
  const [report, setReport] = useState<DailySalesReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchReport = useCallback(async (date: string) => {
    setReportLoading(true);
    setReportError(null);
    try {
      const data = await adminApi.getDailyReport(date);
      setReport(data);
    } catch {
      setReportError('Could not load report. Is purchase-service running?');
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(reportDate);
  }, [fetchReport, reportDate]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

      {/* ── Section 1: Queue Monitor ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SQS Queue Monitor</h1>
            <p className="text-sm text-gray-500 mt-1">
              Queue: <span className="font-mono font-medium text-indigo-600">order-created</span>
              &nbsp;·&nbsp;LocalStack :4566
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

        {queueError && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {queueError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Available" value={stats?.queue.messagesAvailable ?? '—'} desc="Waiting to be consumed" color="indigo" />
          <StatCard label="In-Flight" value={stats?.queue.messagesInFlight ?? '—'} desc="Received, not yet deleted" color="amber" />
          <StatCard label="Delayed" value={stats?.queue.messagesDelayed ?? '—'} desc="Not yet visible" color="gray" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Purchase Records (purchase_db)</h2>
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="Total" value={stats?.purchases.total ?? '—'} />
            <MiniStat label="Pending" value={stats?.purchases.pending ?? '—'} color="amber" />
            <MiniStat label="Confirmed" value={stats?.purchases.confirmed ?? '—'} color="emerald" />
          </div>
        </div>
      </div>

      {/* ── Section 2: Daily Sales Report ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daily Sales Report</h2>
            <p className="text-sm text-gray-500 mt-1">
              Generated from <span className="font-mono font-medium text-indigo-600">purchase_db</span>
              &nbsp;·&nbsp;Cron runs at midnight
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={reportDate}
              max={todayISO()}
              onChange={(e) => setReportDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={() => fetchReport(reportDate)}
              disabled={reportLoading}
              className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {reportLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {reportError && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {reportError}
          </div>
        )}

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <ReportStat
            label="Total Orders"
            value={report ? report.totalOrders : '—'}
            icon="📦"
          />
          <ReportStat
            label="Revenue"
            value={report ? `$${report.totalRevenue.toFixed(2)}` : '—'}
            icon="💰"
            wide
          />
          <ReportStat
            label="Confirmed"
            value={report ? report.confirmedOrders : '—'}
            icon="✅"
            color="emerald"
          />
          <ReportStat
            label="Pending"
            value={report ? report.pendingOrders : '—'}
            icon="⏳"
            color="amber"
          />
          <ReportStat
            label="Customers"
            value={report ? report.uniqueCustomers : '—'}
            icon="👤"
          />
        </div>

        {/* Top products table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Top Products by Quantity Sold</h3>
            <span className="text-xs text-gray-400">{reportDate}</span>
          </div>

          {reportLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : !report || report.topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-sm font-medium">No orders on {reportDate}</p>
              <p className="text-xs mt-1">Try selecting a different date</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-medium">Rank</th>
                  <th className="px-6 py-3 text-left font-medium">Product SKU</th>
                  <th className="px-6 py-3 text-right font-medium">Qty Sold</th>
                  <th className="px-6 py-3 text-right font-medium">Revenue</th>
                  <th className="px-6 py-3 text-left font-medium">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.topProducts.map((product, i) => {
                  const maxQty = report.topProducts[0].quantitySold;
                  const barWidth = Math.round((product.quantitySold / maxQty) * 100);
                  return (
                    <tr key={product.sku} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            i === 0
                              ? 'bg-amber-100 text-amber-700'
                              : i === 1
                              ? 'bg-gray-100 text-gray-600'
                              : i === 2
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-800">{product.sku}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {product.quantitySold}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 w-32">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-400 rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-100">
                  <td colSpan={2} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                    {report.topProducts.reduce((s, p) => s + p.quantitySold, 0)}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-emerald-600">
                    ${report.topProducts.reduce((s, p) => s + p.revenue, 0).toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function StatCard({ label, value, desc, color }: {
  label: string; value: number | string; desc: string; color: 'indigo' | 'amber' | 'gray';
}) {
  const colors = { indigo: 'bg-indigo-50 border-indigo-200', amber: 'bg-amber-50 border-amber-200', gray: 'bg-gray-50 border-gray-200' };
  const valueColors = { indigo: 'text-indigo-700', amber: 'text-amber-700', gray: 'text-gray-700' };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{label}</p>
      <p className={`text-4xl font-bold mb-1 ${valueColors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color?: 'amber' | 'emerald' }) {
  const valueColor = color === 'amber' ? 'text-amber-600' : color === 'emerald' ? 'text-emerald-600' : 'text-gray-800';
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ReportStat({ label, value, icon, color, wide }: {
  label: string; value: number | string; icon: string; color?: 'emerald' | 'amber'; wide?: boolean;
}) {
  const valueColor = color === 'emerald' ? 'text-emerald-600' : color === 'amber' ? 'text-amber-600' : 'text-gray-900';
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1 ${wide ? 'sm:col-span-1' : ''}`}>
      <span className="text-xl">{icon}</span>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function FlowNode({ label, sublabel, color, highlight }: { label: string; sublabel: string; color: string; highlight?: boolean }) {
  const borders: Record<string, string> = { blue: 'border-blue-300 bg-blue-50', indigo: 'border-indigo-400 bg-indigo-50', emerald: 'border-emerald-300 bg-emerald-50', orange: 'border-orange-300 bg-orange-50' };
  return (
    <div className={`rounded-lg border-2 px-4 py-2 text-center min-w-[110px] ${borders[color] ?? 'border-gray-300 bg-gray-50'} ${highlight ? 'shadow-md ring-2 ring-indigo-300' : ''}`}>
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
