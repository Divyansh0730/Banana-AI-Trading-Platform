"use client";
import React, { useState, useEffect } from 'react';
import { Settings, Key, Shield, Bell, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState('Moderate');
  const [maxPosition, setMaxPosition] = useState(100000);
  const [notifyTrades, setNotifyTrades] = useState(true);
  const [notifyMarket, setNotifyMarket] = useState(true);
  const [notifyQuota, setNotifyQuota] = useState(true);
  const [killSwitch, setKillSwitch] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    fetch('http://20.244.83.76:8000/api/v1/settings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setApiKey(data.gemini_api_key || '');
      setRiskTolerance(data.risk_tolerance || 'Moderate');
      setMaxPosition(data.max_position_size || 100000);
      setNotifyTrades(data.notify_trades ?? true);
      setNotifyMarket(data.notify_market ?? true);
      setNotifyQuota(data.notify_quota ?? true);
      setKillSwitch(data.kill_switch_active ?? false);
      setLoading(false);
    });
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    await fetch('http://20.244.83.76:8000/api/v1/settings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        gemini_api_key: apiKey,
        risk_tolerance: riskTolerance,
        max_position_size: maxPosition,
        notify_trades: notifyTrades,
        notify_market: notifyMarket,
        notify_quota: notifyQuota,
        kill_switch_active: killSwitch
      })
    });
    setSaving(false);
    alert("Settings Saved Successfully!");
  };

  const toggleKillSwitch = async () => {
    const newState = !killSwitch;
    setKillSwitch(newState);
    // Auto-save just the kill switch for immediate effect
    if (token) {
        await fetch('http://20.244.83.76:8000/api/v1/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ kill_switch_active: newState })
        });
    }
  };

  if (loading) return <div className="text-white p-8 animate-pulse">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex justify-between items-center bg-[#1C1D21] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="text-banana" size={36} />
            Platform Settings
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Configure AI behavior and API integrations</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors cursor-pointer"
             onClick={toggleKillSwitch}
             style={{ borderColor: killSwitch ? '#ef4444' : '#10b981', backgroundColor: killSwitch ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
            <span className={`text-xl font-black tracking-widest uppercase ${killSwitch ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                {killSwitch ? 'TRADING HALTED' : 'SYSTEM ACTIVE'}
            </span>
            <span className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Master Kill Switch</span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* API Configuration */}
        <div className="glass-card p-8 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Key className="text-banana" size={24} />
            <h2 className="text-xl font-bold text-white">API Configuration</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Google Gemini API Key</label>
            <p className="text-xs text-gray-500 mb-2">Used by the backend to power the algorithmic trading engine. If you hit quota limits, you can provide a new key here.</p>
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#1C1D21] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-banana transition-colors pr-12 font-mono"
              />
              <button 
                className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* AI Trading Parameters */}
        <div className="glass-card p-8 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Shield className="text-banana" size={24} />
            <h2 className="text-xl font-bold text-white">AI Risk Parameters</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-400">Risk Tolerance</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Conservative', 'Moderate', 'Aggressive'].map(risk => (
                <button 
                  key={risk}
                  onClick={() => setRiskTolerance(risk)}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${riskTolerance === risk ? 'bg-banana/10 border-banana text-banana' : 'bg-[#1C1D21] border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  <span className="font-bold">{risk}</span>
                  <span className="text-xs text-center opacity-70">
                    {risk === 'Conservative' && 'Strict stop-losses, low leverage.'}
                    {risk === 'Moderate' && 'Balanced approach, medium leverage.'}
                    {risk === 'Aggressive' && 'High frequency, max capital deployment.'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm font-semibold text-gray-400">Maximum Position Size (INR)</label>
            <input type="range" min="10000" max="500000" step="10000" className="w-full accent-banana mt-2" value={maxPosition} onChange={(e) => setMaxPosition(Number(e.target.value))} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹10,000</span>
              <span>₹{maxPosition.toLocaleString()}</span>
              <span>₹5,00,000</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-8 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Bell className="text-banana" size={24} />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-[#1C1D21] border border-white/5 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-sm">Trade Execution Alerts</h3>
                <p className="text-xs text-gray-500 mt-1">Get notified when the AI opens or closes a position.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifyTrades} onChange={(e) => setNotifyTrades(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1C1D21] border border-white/5 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-sm">Significant Market Moves</h3>
                <p className="text-xs text-gray-500 mt-1">Alerts for sudden 5%+ swings in tracked assets.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifyMarket} onChange={(e) => setNotifyMarket(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1C1D21] border border-white/5 rounded-xl">
              <div>
                <h3 className="font-bold text-white text-sm">API Quota Warnings</h3>
                <p className="text-xs text-gray-500 mt-1">Receive a warning when Gemini API usage reaches 80%.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifyQuota} onChange={(e) => setNotifyQuota(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end mt-4">
           <button onClick={handleSave} disabled={saving} className="bg-banana hover:bg-[#FFE55C] text-black font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-50">
             <Save size={20} />
             {saving ? 'Saving...' : 'Save Configurations'}
           </button>
        </div>

      </div>
    </div>
  );
}
