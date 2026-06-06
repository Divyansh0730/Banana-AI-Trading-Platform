"use client";
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, Layers, Activity } from 'lucide-react';

interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
}

export default function TradePage() {
  const [orderType, setOrderType] = useState('Limit');
  const [side, setSide] = useState('Buy');
  const [btcPrice, setBtcPrice] = useState(0);
  const [priceColor, setPriceColor] = useState('text-green-400');
  const [chartData, setChartData] = useState<{time: string; price: number}[]>([]);
  const [volume24h, setVolume24h] = useState(0);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [orderPrice, setOrderPrice] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const priceRef = useRef(0);

  // Generate realistic order book entries around current price
  const generateOrderBook = (currentPrice: number) => {
    if (currentPrice <= 0) return;
    const spread = currentPrice * 0.0001; // 0.01% spread
    
    const newAsks: OrderBookEntry[] = [];
    let askTotal = 0;
    for (let i = 5; i >= 1; i--) {
      const p = currentPrice + (spread * i);
      const amt = parseFloat((Math.random() * 3 + 0.1).toFixed(2));
      askTotal += amt;
      newAsks.push({
        price: p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        amount: amt.toFixed(2),
        total: askTotal.toFixed(2)
      });
    }

    const newBids: OrderBookEntry[] = [];
    let bidTotal = 0;
    for (let i = 1; i <= 5; i++) {
      const p = currentPrice - (spread * i);
      const amt = parseFloat((Math.random() * 4 + 0.2).toFixed(2));
      bidTotal += amt;
      newBids.push({
        price: p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        amount: amt.toFixed(2),
        total: bidTotal.toFixed(2)
      });
    }

    setAsks(newAsks);
    setBids(newBids);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const ws = new WebSocket(`ws://20.244.83.76:8000/ws/market?token=${token}`);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.event === 'price_update' && msg.data.symbol === 'BTC/USDT') {
        const newPrice = msg.data.price;
        setBtcPrice(prev => {
          setPriceColor(newPrice > prev ? 'text-green-400' : 'text-red-400');
          return newPrice;
        });
        setVolume24h(msg.data.volume || 0);
        priceRef.current = newPrice;
        
        // Update chart
        setChartData(prev => [
          ...prev.slice(-29),
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), price: newPrice }
        ]);
        
        // Update order book around live price
        generateOrderBook(newPrice);
        
        // Update order price input when in Market mode
        if (!document.querySelector('input[data-edited="true"]')) {
          setOrderPrice(newPrice.toFixed(2));
        }
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto animate-fade-in pb-12 h-full">
      {/* Header section */}
      <div className="flex justify-between items-center glass-card p-4 border border-white/5">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            BTC/USDT
          </h1>
          <div className={`${priceColor} font-bold text-xl transition-colors`}>
            {btcPrice > 0 ? btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '---'} USDT
          </div>
          <div className="text-sm text-gray-400 flex flex-col">
            <span>24h Vol</span>
            <span className="text-white">{volume24h > 0 ? volume24h.toLocaleString(undefined, {maximumFractionDigits: 0}) : '---'}</span>
          </div>
          <div className="text-sm text-gray-400 flex flex-col">
            <span>24h High</span>
            <span className="text-white">{btcPrice > 0 ? (btcPrice * 1.01).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '---'} USDT</span>
          </div>
          <div className="text-sm text-gray-400 flex flex-col">
            <span>24h Low</span>
            <span className="text-white">{btcPrice > 0 ? (btcPrice * 0.98).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '---'} USDT</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white/5 rounded-lg text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2">
            <Zap size={16} className="text-banana" /> Auto-Trade: OFF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-4 border border-white/5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <button className="text-banana text-sm font-bold border-b-2 border-banana pb-1">Live</button>
            </div>
            <div className="flex gap-2 text-gray-400">
              <Activity size={18} />
              <Layers size={18} />
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[300px]">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} orientation="right" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1C1D21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#FFD700' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">
                Connecting to live market feed...
              </div>
            )}
          </div>
        </div>

        {/* Order Book — Generated from live price */}
        <div className="glass-card p-0 border border-white/5 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/5 font-semibold text-white">Order Book</div>
          <div className="flex-1 flex flex-col text-xs font-mono">
            <div className="flex justify-between px-4 py-2 text-gray-500">
              <span>Price(USDT)</span>
              <span>Amount(BTC)</span>
              <span>Total</span>
            </div>
            
            {/* Asks */}
            <div className="flex-1 flex flex-col-reverse px-2">
              {asks.length > 0 ? asks.map((ask, i) => (
                <div key={i} className="flex justify-between px-2 py-1 hover:bg-white/5 cursor-pointer relative group">
                  <div className="absolute top-0 right-0 h-full bg-red-500/10 -z-10 transition-all group-hover:bg-red-500/20" style={{ width: `${(parseFloat(ask.total) / 8) * 100}%` }}></div>
                  <span className="text-red-400">{ask.price}</span>
                  <span className="text-gray-300">{ask.amount}</span>
                  <span className="text-gray-500">{ask.total}</span>
                </div>
              )) : (
                <div className="flex items-center justify-center text-gray-600 py-4">Waiting...</div>
              )}
            </div>
            
            {/* Spread */}
            <div className="py-2 px-4 border-y border-white/5 text-center text-green-400 font-bold text-lg flex items-center justify-center gap-2">
              <TrendingUp size={16} /> {btcPrice > 0 ? btcPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '---'}
            </div>

            {/* Bids */}
            <div className="flex-1 flex flex-col px-2">
              {bids.length > 0 ? bids.map((bid, i) => (
                <div key={i} className="flex justify-between px-2 py-1 hover:bg-white/5 cursor-pointer relative group">
                   <div className="absolute top-0 right-0 h-full bg-green-500/10 -z-10 transition-all group-hover:bg-green-500/20" style={{ width: `${(parseFloat(bid.total) / 12) * 100}%` }}></div>
                  <span className="text-green-400">{bid.price}</span>
                  <span className="text-gray-300">{bid.amount}</span>
                  <span className="text-gray-500">{bid.total}</span>
                </div>
              )) : (
                <div className="flex items-center justify-center text-gray-600 py-4">Waiting...</div>
              )}
            </div>
          </div>
        </div>

        {/* Order Entry Panel */}
        <div className="glass-card p-6 border border-white/5 flex flex-col h-full">
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
            {['Buy', 'Sell'].map(t => (
              <button 
                key={t}
                onClick={() => setSide(t)}
                className={`flex-1 py-2 rounded-md font-bold transition-all ${side === t ? (t === 'Buy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'text-gray-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
            {['Limit', 'Market', 'Stop Limit'].map(t => (
              <button 
                key={t}
                onClick={() => setOrderType(t)}
                className={`text-sm font-semibold transition-all ${orderType === t ? 'text-banana' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Price (USDT)</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-[#1C1D21] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-banana transition-colors" 
                  value={orderType === 'Market' ? (btcPrice > 0 ? btcPrice.toFixed(2) : '---') : orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  disabled={orderType === 'Market'} 
                />
                <span className="absolute right-4 top-3 text-gray-500 text-sm">USDT</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Amount (BTC)</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-[#1C1D21] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-banana transition-colors" 
                  placeholder="0.00"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                />
                <span className="absolute right-4 top-3 text-gray-500 text-sm">BTC</span>
              </div>
            </div>

            <div className="flex justify-between gap-1 mt-2">
               {['25%', '50%', '75%', '100%'].map(pct => (
                 <button key={pct} className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-gray-400 transition-colors">{pct}</button>
               ))}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-lg font-bold text-white">
                {orderAmount && orderPrice ? (parseFloat(orderAmount) * parseFloat(orderPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} USDT
              </span>
            </div>

            <button className={`w-full py-4 rounded-xl font-bold text-lg mt-auto transition-all transform hover:scale-[1.02] ${side === 'Buy' ? 'bg-green-500 hover:bg-green-400 text-white' : 'bg-red-500 hover:bg-red-400 text-white'}`}>
              {side} BTC
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
