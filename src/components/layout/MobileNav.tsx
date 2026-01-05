import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function MobileNav() {
  const location = useLocation();
  const { profile, isCreator } = useAuth();

  const navItems = [
    { icon: Home, label: 'Home', path: '/feed' },
    { icon: Search, label: 'Discover', path: '/discover' },
    ...(isCreator ? [{ icon: PlusCircle, label: 'Create', path: '/create' }] : []),
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: `/creator/${profile?.username || profile?.id}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className={cn(
              "h-6 w-6",
              item.label === 'Create' && "text-primary"
            )} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}