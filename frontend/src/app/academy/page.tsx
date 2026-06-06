"use client";
import React from 'react';
import { BookOpen, PlayCircle, CheckCircle, Lock, Trophy } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Intro to AI Trading',
    description: 'Learn how Large Language Models analyze market sentiment.',
    progress: 100,
    locked: false,
    duration: '45 mins',
    modules: 4
  },
  {
    id: 2,
    title: 'Mastering the Order Book',
    description: 'Understand liquidity, slippage, and spread in crypto markets.',
    progress: 30,
    locked: false,
    duration: '1h 20m',
    modules: 6
  },
  {
    id: 3,
    title: 'Advanced Gemini Strategies',
    description: 'Prompt engineering for highly accurate algorithmic trading.',
    progress: 0,
    locked: true,
    duration: '2h 15m',
    modules: 8
  },
  {
    id: 4,
    title: 'Risk Management 101',
    description: 'Protect your capital with dynamic stop-losses and position sizing.',
    progress: 0,
    locked: true,
    duration: '50 mins',
    modules: 3
  }
];

export default function AcademyPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-banana" size={36} />
            Banana AI Academy
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Master algorithmic trading and AI models</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="glass-card p-8 border border-white/5 relative overflow-hidden flex items-center justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-banana/10 to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white">Your Learning Journey</h2>
          <p className="text-gray-400 max-w-md">You are currently in the Top 15% of learners this week. Keep up the momentum to unlock advanced AI modules!</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              <span className="text-gray-400 text-xs uppercase tracking-wider">Completed</span>
              <div className="text-xl font-bold text-white">1 / 4 Courses</div>
            </div>
            <div className="bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              <span className="text-gray-400 text-xs uppercase tracking-wider">XP Earned</span>
              <div className="text-xl font-bold text-banana flex items-center gap-2">
                <Trophy size={16} /> 1,250
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 hidden md:block">
           <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
             <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
             <circle cx="60" cy="60" r="50" fill="none" stroke="#FFD700" strokeWidth="12" strokeDasharray="314" strokeDashoffset="235" className="transition-all duration-1000" />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center flex-col">
             <span className="text-2xl font-bold text-white">25%</span>
           </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {courses.map((course) => (
          <div key={course.id} className={`glass-card p-6 border transition-all ${course.locked ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-banana/30 hover:-translate-y-1'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${course.progress === 100 ? 'bg-green-500/20 text-green-400' : course.locked ? 'bg-white/5 text-gray-500' : 'bg-banana/20 text-banana'}`}>
                  {course.progress === 100 ? <CheckCircle size={24} /> : course.locked ? <Lock size={24} /> : <PlayCircle size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{course.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1 font-medium">
                    <span>{course.modules} Modules</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 h-10">{course.description}</p>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className={course.progress === 100 ? 'text-green-400' : 'text-gray-400'}>
                  {course.progress === 100 ? 'Completed' : course.locked ? 'Locked' : `${course.progress}% Complete`}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-green-400' : 'bg-banana'}`} 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
            
            <button 
              disabled={course.locked}
              className={`w-full mt-6 py-3 rounded-xl font-bold transition-all ${course.locked ? 'bg-white/5 text-gray-500 cursor-not-allowed' : course.progress === 100 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-banana text-black hover:bg-[#FFE55C]'}`}
            >
              {course.progress === 100 ? 'Review Material' : course.locked ? 'Unlock Previous Courses' : 'Continue Learning'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
