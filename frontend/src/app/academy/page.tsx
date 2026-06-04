import { BookOpen, PlayCircle, BrainCircuit, ShieldAlert, Award } from 'lucide-react';

export default function Academy() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center text-center py-10 bg-gradient-to-b from-[#eab308]/10 to-transparent rounded-3xl border border-[#eab308]/20">
        <div className="w-16 h-16 bg-[#eab308] rounded-2xl flex items-center justify-center text-black mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl font-bold mb-4">Banana Trading Academy</h1>
        <p className="text-gray-400 max-w-2xl text-lg">
          Welcome to the Omni-Asset Masterclass. Learn exactly how our AI makes decisions, how to configure your risk limits, and the secrets to consistent institutional-grade profitability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module 1 */}
        <div className="glass-card p-6 flex flex-col gap-4 group cursor-pointer hover:border-[#eab308]/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <PlayCircle size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">1. The "Paper Trading" Secret</h3>
            <p className="text-gray-400 text-sm">
              Learn how to test AI strategies with $100,000 of mock money before risking a single real penny in the live markets.
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-[#27272a] flex justify-between items-center text-sm">
            <span className="text-gray-500">Video • 5 mins</span>
            <span className="text-blue-400 font-medium">Start Lesson &rarr;</span>
          </div>
        </div>

        {/* Module 2 */}
        <div className="glass-card p-6 flex flex-col gap-4 group cursor-pointer hover:border-[#10b981]/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981] group-hover:scale-110 transition-transform">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2. How the AI Thinks (FinRL)</h3>
            <p className="text-gray-400 text-sm">
              Deep dive into Reinforcement Learning. Understand why the AI chooses to Buy Nifty Options while shorting Bitcoin simultaneously.
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-[#27272a] flex justify-between items-center text-sm">
            <span className="text-gray-500">Article • 12 mins</span>
            <span className="text-[#10b981] font-medium">Start Lesson &rarr;</span>
          </div>
        </div>

        {/* Module 3 */}
        <div className="glass-card p-6 flex flex-col gap-4 group cursor-pointer hover:border-[#ef4444]/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center text-[#ef4444] group-hover:scale-110 transition-transform">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">3. The Kill Switch (Risk Setup)</h3>
            <p className="text-gray-400 text-sm">
              The single most important lesson. How to set your Max Drawdown and Stop Losses so you never blow up your account.
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-[#27272a] flex justify-between items-center text-sm">
            <span className="text-gray-500">Interactive • 8 mins</span>
            <span className="text-[#ef4444] font-medium">Start Lesson &rarr;</span>
          </div>
        </div>

      </div>

      <div className="glass-card p-8 mt-12 bg-gradient-to-r from-transparent via-[#27272a]/30 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#eab308]/20 flex items-center justify-center text-[#eab308]">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Earn your Trading Certificate</h3>
            <p className="text-gray-400 text-sm">Complete all 12 modules to unlock advanced AI settings.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
          Resume Course
        </button>
      </div>

    </div>
  );
}
