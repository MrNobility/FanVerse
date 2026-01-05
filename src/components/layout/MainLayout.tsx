import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}