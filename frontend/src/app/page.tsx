"use client";
import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, DollarSign, BrainCircuit } from 'lucide-react';

export default function Dashboard() {
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    "NIFTY24MAY22000CE": 145.20,
    "BTC/USDT": 64200.00,
    "AAPL": 189.50
  });
  
  const [lastUpdatedSymbol, setLastUpdatedSymbol] = useState<string>("");

  useEffect(() => {
    // Connect to the FastAPI WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/market");
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event === "price_update") {
          const { symbol, price } = message.data;
          setLivePrices((prev) => ({
            ...prev,
            [symbol]: price
          }));
          setLastUpdatedSymbol(symbol);
          
          // Reset the highlight after 500ms
          setTimeout(() => setLastUpdatedSymbol(""), 500);
        }
      } catch (e) {
        console.error("Error parsing websocket message", e);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <DollarSign size={16} /> Total Balance (Paper)
          </span>
          <h2 className="text-3xl font-bold text-white">$24,592.50</h2>
          <span className="text-[#10b981] flex items-center text-sm font-medium mt-1">
            <ArrowUpRight size={16} className="mr-1" /> +$450.20 (1.8%) Today
          </span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <TrendingUp size={16} /> Win Rate (Last 30 Days)
          </span>
          <h2 className="text-3xl font-bold text-white">68.4%</h2>
          <span className="text-gray-400 text-sm mt-1">Based on 142 trades</span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium flex items-center gap-2">
            <BrainCircuit size={16} /> AI Confidence Average
          </span>
          <h2 className="text-3xl font-bold text-white">82%</h2>
          <span className="text-[#10b981] text-sm mt-1">High Accuracy Mode</span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-2 bg-gradient-to-br from-[#eab308]/20 to-transparent border-[#eab308]/30">
          <span className="text-[#eab308] text-sm font-medium flex items-center gap-2">
            <Activity size={16} /> Current Market Regime
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Bullish Trend</h2>
          <span className="text-gray-300 text-sm mt-1">Gemini Sentiment: Highly Positive</span>
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
                  <th className="pb-3 font-medium">Market</th>
                  <th className="pb-3 font-medium">Side</th>
                  <th className="pb-3 font-medium">Live Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                <tr className={lastUpdatedSymbol === "NIFTY24MAY22000CE" ? "bg-[#10b981]/10 transition-colors" : "transition-colors duration-500"}>
                  <td className="py-4 font-bold">NIFTY24MAY22000CE</td>
                  <td className="py-4 text-gray-400">NSE (India)</td>
                  <td className="py-4"><span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] rounded text-xs font-bold">LONG</span></td>
                  <td className="py-4 font-mono font-bold text-[#eab308]">₹{livePrices["NIFTY24MAY22000CE"]?.toFixed(2)}</td>
                </tr>
                <tr className={lastUpdatedSymbol === "BTC/USDT" ? "bg-[#ef4444]/10 transition-colors" : "transition-colors duration-500"}>
                  <td className="py-4 font-bold">BTC/USDT</td>
                  <td className="py-4 text-gray-400">Binance</td>
                  <td className="py-4"><span className="px-2 py-1 bg-[#ef4444]/10 text-[#ef4444] rounded text-xs font-bold">SHORT</span></td>
                  <td className="py-4 font-mono font-bold text-[#eab308]">${livePrices["BTC/USDT"]?.toFixed(2)}</td>
                </tr>
                <tr className={lastUpdatedSymbol === "AAPL" ? "bg-[#10b981]/10 transition-colors" : "transition-colors duration-500"}>
                  <td className="py-4 font-bold">AAPL</td>
                  <td className="py-4 text-gray-400">NASDAQ</td>
                  <td className="py-4"><span className="px-2 py-1 bg-[#10b981]/10 text-[#10b981] rounded text-xs font-bold">LONG</span></td>
                  <td className="py-4 font-mono font-bold text-[#eab308]">${livePrices["AAPL"]?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Action Log */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6">AI Execution Log</h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start border-b border-[#27272a] pb-4">
              <div className="w-8 h-8 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <BrainCircuit size={16} className="text-[#10b981]" />
              </div>
              <div>
                <p className="text-sm font-medium">Bought NIFTY 22000 CE</p>
                <p className="text-xs text-gray-400 mt-1">"Option Chain shows massive Put writing at 21800. Strong support detected." - Gemini</p>
                <span className="text-xs text-gray-500 mt-2 block">2 mins ago</span>
              </div>
            </div>
            
            <div className="flex gap-4 items-start border-b border-[#27272a] pb-4">
              <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Activity size={16} className="text-[#ef4444]" />
              </div>
              <div>
                <p className="text-sm font-medium">Shorted BTC/USDT</p>
                <p className="text-xs text-gray-400 mt-1">"RSI Divergence on 15m chart. Volume dropping on uptrend." - Vertex AI</p>
                <span className="text-xs text-gray-500 mt-2 block">45 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
