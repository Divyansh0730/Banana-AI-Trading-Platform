"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isLoading) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] text-banana font-bold">Loading Banana AI...</div>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </AuthProvider>
  );
}
