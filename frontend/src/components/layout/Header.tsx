import { Bell, Search, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search markets (e.g. BTC, RELIANCE, NIFTY)" 
            className="bg-[#18181b] border border-[#27272a] text-white pl-10 pr-4 py-2 rounded-full w-96 focus:outline-none focus:border-[#eab308] transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full text-[#10b981] text-xs font-medium">
          <Activity size={14} className="animate-pulse" />
          <span>AI Engine Active</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full text-xs font-medium">
          <span className="text-gray-400">Mode:</span>
          <span className="text-[#eab308]">Paper Trading</span>
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#eab308] rounded-full"></span>
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#eab308] to-orange-500 p-0.5 cursor-pointer hover-scale">
          <div className="w-full h-full bg-[#18181b] rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">US</span>
          </div>
        </div>
      </div>
    </header>
  );
}
