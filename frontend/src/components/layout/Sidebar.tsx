"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, BookOpen, Settings, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-[var(--background)] border-r border-[#27272a] flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#eab308] rounded-lg flex items-center justify-center text-black font-bold text-xl">B</div>
        <h1 className="text-xl font-bold text-white tracking-wider">BANANA AI</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {[
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Live Trading', path: '/trade', icon: TrendingUp },
          { name: 'Portfolio', path: '/portfolio', icon: Wallet },
          { name: 'Academy', path: '/academy', icon: BookOpen },
        ].map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'text-[#eab308] bg-[#eab308]/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-[#27272a]'}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#27272a]">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-colors mt-1">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
