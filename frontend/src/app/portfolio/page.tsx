"use client";
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Clock, Activity, Briefcase } from 'lucide-react';

interface Stats {
  roi: number;
  win_rate: number;
  best_asset: string;
  total_trades: number;
}

interface TradeRow {
  id: string | number;
  asset: string;
  type: string;
  price: number | string;
  qty: number | string;
  time: string;
  pnl: string;
}

export default function PortfolioPage() {
  const [chartData, setChartData] = useState<{time: string; balance: number}[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [stats, setStats] = useState<Stats>({ roi: 0, win_rate: 0, best_asset: 'N/A', total_trades: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch initial portfolio balance
    fetch('http://20.244.83.76:8000/api/v1/portfolio', { headers })
      .then(res => res.json())
      .then(data => {
        if (data && data.balance) {
          setChartData([
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), balance: data.balance }
          ]);
        }
      })
      .catch(err => console.error(err));

    // Fetch real stats
    fetch('http://20.244.83.76:8000/api/v1/stats', { headers })
      .then(res => res.json())
      .then(data => {
        if (data && !data.detail) setStats(data);
      })
      .catch(err => console.error(err));

    // Fetch initial trades
    fetch('http://20.244.83.76:8000/api/v1/trades', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTrades(data);
      })
      .catch(err => console.error(err));

    // Connect to WebSocket for live portfolio updates
    const ws = new WebSocket(`ws://20.244.83.76:8000/ws/market?token=${token}`);
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "portfolio_update") {
          const newBalance = message.data.balance;
          setChartData(prev => [
            ...prev.slice(-11), // keep last 12 points
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), balance: newBalance }
          ]);
        } else if (message.event === "ai_signal") {
          const signal = message.data;
          const newTrade = {
            id: Date.now(),
            asset: signal.asset,
            type: signal.action.toUpperCase(),
            price: 'Live',
            qty: (parseFloat(signal.amount) / 83.5 / 50000).toFixed(6),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            pnl: '+0'
          };
          setTrades(prev => [newTrade, ...prev].slice(0, 15));
          // Update stats count
          setStats(prev => ({ ...prev, total_trades: prev.total_trades + 1 }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    return () => ws.close();
  }, []);

  const roiColor = stats.roi >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="text-banana" size={36} />
            Portfolio Analytics
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Real-time performance & trade history</p>
        </div>
      </div>

      {/* Top Metrics Cards — Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">Total ROI (All Time)</span>
          <h2 className={`text-3xl font-bold ${roiColor} flex items-center gap-2`}>
            {stats.roi >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            {stats.roi >= 0 ? '+' : ''}{stats.roi}%
          </h2>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">Total Trades</span>
          <h2 className="text-3xl font-bold text-white">{stats.total_trades}</h2>
        </div>
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <Activity size={16} /> Most Traded Asset
          </span>
          <h2 className="text-3xl font-bold text-white">{stats.best_asset}</h2>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="glass-card p-6 border border-white/5 relative overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1D21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFD700' }}
                />
                <Line type="monotone" dataKey="balance" stroke="#FFD700" strokeWidth={3} dot={false} activeDot={{ r: 8, fill: '#FFD700' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Waiting for portfolio data...</p>
            </div>
          )}
        </div>
      </div>

      {/* Trade History Table */}
      <div className="glass-card p-0 overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={20} className="text-banana" /> Trade History
          </h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-sm font-medium text-gray-400">Asset</th>
                <th className="p-4 text-sm font-medium text-gray-400">Type</th>
                <th className="p-4 text-sm font-medium text-gray-400">Entry Price</th>
                <th className="p-4 text-sm font-medium text-gray-400">Quantity</th>
                <th className="p-4 text-sm font-medium text-gray-400">Time</th>
                <th className="p-4 text-sm font-medium text-gray-400 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No trades yet. The AI engine will start executing trades shortly...
                  </td>
                </tr>
              )}
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-sm font-semibold text-white">{trade.asset}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{typeof trade.price === 'number' ? trade.price.toLocaleString() : trade.price}</td>
                  <td className="p-4 text-sm text-gray-300">{typeof trade.qty === 'number' ? trade.qty.toFixed(6) : trade.qty}</td>
                  <td className="p-4 text-sm text-gray-400">{trade.time}</td>
                  <td className={`p-4 text-sm font-medium text-right ${String(trade.pnl).startsWith('+') || String(trade.pnl).startsWith('0') ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
