import Link from 'next/link';
import { LayoutDashboard, TrendingUp, BookOpen, Settings, LogOut, Wallet } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[var(--background)] border-r border-[#27272a] flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#eab308] rounded-lg flex items-center justify-center text-black font-bold text-xl">B</div>
        <h1 className="text-xl font-bold text-white tracking-wider">BANANA AI</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/trade" className="flex items-center gap-3 px-4 py-3 text-[#eab308] bg-[#eab308]/10 rounded-xl transition-colors">
          <TrendingUp size={20} />
          <span className="font-medium">Live Trading</span>
        </Link>
        <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors">
          <Wallet size={20} />
          <span>Portfolio</span>
        </Link>
        <Link href="/academy" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors">
          <BookOpen size={20} />
          <span>Academy</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-[#27272a]">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-colors mt-1">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
