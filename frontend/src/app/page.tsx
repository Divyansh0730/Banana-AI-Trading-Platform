"use client";
import { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, TrendingDown, TrendingUp, Activity, DollarSign, BrainCircuit } from 'lucide-react';

interface PriceData {
  price: number;
  lastUpdated: string;
}

interface AILog {
  id: string;
  timestamp: string;
  action: string;
  asset: string;
  target_profit: number;
  max_loss: number;
  time_horizon: string;
  confidence: number;
  reason: string;
}

interface Position {
  asset: string;
  quantity: number;
  average_entry_price: number;
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<{balance: number, currency: string, open_positions: number} | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const pricesRef = useRef<Record<string, PriceData>>({});
  const [aiLogs, setAiLogs] = useState<AILog[]>([]);
  const [lastUpdatedSymbol, setLastUpdatedSymbol] = useState<string>("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [totalSignals, setTotalSignals] = useState(0);
  const [tradingAmount, setTradingAmount] = useState<Record<string, number>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleRefreshWallet = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://20.244.83.76:8000/api/v1/wallet/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(prev => prev ? { ...prev, balance: data.balance } : null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeTrade = async (signal: AILog) => {
    const token = localStorage.getItem('token');
    const amount = tradingAmount[signal.id] || 50000;
    try {
      const res = await fetch('http://20.244.83.76:8000/api/v1/trade/execute', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset: signal.asset,
          action: signal.action,
          amount: amount,
          ai_signal_id: signal.id
        })
      });
      if (res.ok) {
        alert(`Successfully executed ${signal.action} for ${signal.asset}`);
        // Refetch portfolio and positions
        const headers = { 'Authorization': `Bearer ${token}` };
        fetch('http://20.244.83.76:8000/api/v1/portfolio', { headers })
          .then(res => res.json())
          .then(data => setPortfolio(data));
        fetch('http://20.244.83.76:8000/api/v1/positions', { headers })
          .then(res => res.json())
          .then(data => setPositions(data));
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Initial fetch
    fetch('http://20.244.83.76:8000/api/v1/portfolio', { headers })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setPortfolio(data))
      .catch(err => console.error("Error fetching portfolio:", err));

    fetch('http://20.244.83.76:8000/api/v1/positions', { headers })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setPositions(data))
      .catch(err => console.error("Error fetching positions:", err));

    // Set up WebSocket for live updates (only if authenticated)
    const ws = new WebSocket(`ws://20.244.83.76:8000/ws/market?token=${token}`);
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "price_update") {
          const { symbol, price } = message.data;
          setPrices(prev => ({ ...prev, [symbol]: { price, lastUpdated: new Date().toLocaleTimeString() } }));
        } else if (message.event === "ai_signal") {
          const signal = message.data;
            setAiLogs((prev) => [
              {
                id: signal.id || Date.now().toString(),
                timestamp: new Date().toLocaleTimeString(),
                action: signal.action,
                asset: signal.asset,
                target_profit: signal.target_profit,
                max_loss: signal.max_loss,
                time_horizon: signal.time_horizon,
                confidence: signal.confidence,
                reason: signal.reason
              },
              ...prev
            ].slice(0, 5));
            setTotalSignals(prev => prev + 1);
            // Compute a dynamic AI confidence based on actual signal confidence
            setAiConfidence(signal.confidence);
        } else if (message.event === "portfolio_update") {
          setPortfolio(prev => prev ? { ...prev, balance: message.data.balance } : null);
        }
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2 relative">
          <div className="flex justify-between items-center w-full">
            <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
              <DollarSign size={16} /> Dummy Wallet (INR)
            </span>
            <button onClick={handleRefreshWallet} className="text-xs bg-[#eab308] text-black px-2 py-1 rounded hover:bg-[#ca8a04]">
              Refresh
            </button>
          </div>
          <h2 className="text-3xl font-bold text-white">{portfolio ? formatCurrency(portfolio.balance) : "₹0.00"}</h2>
          <span className={`${portfolio && portfolio.balance >= 2000000 ? 'text-[#10b981]' : 'text-[#ef4444]'} flex items-center text-sm font-medium mt-1`}>
            {portfolio ? (
              <>
                <ArrowUpRight size={16} className="mr-1" />
                {((portfolio.balance - 2000000) / 2000000 * 100).toFixed(2)}% from initial
              </>
            ) : '—'}
          </span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <TrendingUp size={16} /> Open Positions
          </span>
          <h2 className="text-3xl font-bold text-white">{positions.length}</h2>
          <span className="text-gray-400 text-sm mt-1">Active trading pairs</span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <BrainCircuit size={16} /> AI Confidence Average
          </span>
          <h2 className="text-3xl font-bold text-white">{aiConfidence > 0 ? `${aiConfidence}%` : '—'}</h2>
          <span className="text-[#10b981] text-sm mt-1">{totalSignals} signals generated</span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 bg-gradient-to-br from-[#eab308]/20 to-transparent border-[#eab308]/30">
          <span className={`${portfolio && portfolio.balance >= 2000000 ? 'text-[#10b981]' : 'text-[#ef4444]'} flex items-center text-sm font-medium mt-1`}>
            {portfolio ? (
              <>
                {portfolio.balance >= 2000000 ? <ArrowUpRight size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                {((portfolio.balance - 2000000) / 2000000 * 100).toFixed(2)}% from initial
              </>
            ) : '—'}
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">{Object.keys(prices).length > 0 ? 'Live Tracking' : 'Connecting...'}</h2>
          <span className="text-gray-300 text-sm mt-1">{Object.keys(prices).length} assets streaming</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Positions Table */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity size={18} className="text-[#eab308] animate-pulse" /> 
              Live Open Positions
            </h3>
            <span className="text-xs text-gray-400">Powered by FastAPI WebSockets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-[#27272a]">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Avg Entry Price</th>
                  <th className="pb-3 font-medium">Live Price</th>
                  <th className="pb-3 font-medium">Live P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No open positions yet. Waiting for AI...
                    </td>
                  </tr>
                )}
                {positions.map((pos) => {
                  const livePrice = prices[pos.asset]?.price || 0;
                  const livePriceINR = livePrice * 83.5;
                  const pnl = (livePriceINR - pos.average_entry_price) * pos.quantity;
                  const isProfit = pnl >= 0;
                  return (
                    <tr key={pos.asset} className={lastUpdatedSymbol === pos.asset ? "bg-[#10b981]/10 transition-colors" : "transition-colors duration-500"}>
                      <td className="py-4 font-bold">{pos.asset}</td>
                      <td className="py-4 text-gray-400">{pos.quantity.toFixed(4)}</td>
                      <td className="py-4 text-gray-400">{formatCurrency(pos.average_entry_price)}</td>
                      <td className="py-4 font-mono font-bold text-white">{formatCurrency(livePriceINR)}</td>
                      <td className={`py-4 font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {isProfit ? '+' : ''}{formatCurrency(pnl)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Action Log */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BrainCircuit size={18} className="text-[#10b981] animate-pulse" />
              AI Advisory Signals
            </h3>
            <span className="text-xs text-[#eab308] bg-[#eab308]/10 px-2 py-1 rounded">Action Required</span>
          </div>
          <div className="space-y-4">
            {aiLogs.length === 0 && (
              <p className="text-sm text-gray-400 italic">Waiting for AI market analysis...</p>
            )}
            {aiLogs.map((log) => {
              const isBuy = log.action?.toLowerCase().includes("buy") || log.action?.toLowerCase().includes("long");
              return (
                <div key={log.id} className="flex flex-col gap-3 bg-[#18181b] p-4 rounded-lg border border-[#27272a] animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBuy ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#ef4444]/20 text-[#ef4444]'}`}>
                        <BrainCircuit size={16} />
                      </div>
                      <span className="font-bold text-lg">{log.action} {log.asset}</span>
                    </div>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 bg-black/30 p-2 rounded">
                    <div><span className="text-gray-500">Target Profit:</span> <span className="text-[#10b981]">+{log.target_profit}%</span></div>
                    <div><span className="text-gray-500">Max Loss:</span> <span className="text-[#ef4444]">-{log.max_loss}%</span></div>
                    <div><span className="text-gray-500">Horizon:</span> {log.time_horizon}</div>
                    <div><span className="text-gray-500">Confidence:</span> {log.confidence}%</div>
                  </div>
                  
                  <p className="text-gray-400 text-sm italic border-l-2 border-[#eab308] pl-2 my-1">
                    "{log.reason}"
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="number" 
                      placeholder="Amount (INR)"
                      className="bg-black border border-gray-700 rounded px-3 py-1 text-sm w-full focus:outline-none focus:border-[#eab308]"
                      value={tradingAmount[log.id] || ''}
                      onChange={(e) => setTradingAmount(prev => ({...prev, [log.id]: parseFloat(e.target.value)}))}
                    />
                    <button 
                      onClick={() => executeTrade(log)}
                      className={`px-4 py-1 rounded text-sm font-bold flex-shrink-0 ${isBuy ? 'bg-[#10b981] hover:bg-[#059669] text-white' : 'bg-[#ef4444] hover:bg-[#dc2626] text-white'}`}
                    >
                      Execute
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
