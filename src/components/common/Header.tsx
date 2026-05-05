
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import OrderCart from '@/app/components/customer/OrderCart';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Customer' },
  { href: '/waiter', label: 'Waiter' },
  { href: '/chef', label: 'Chef' },
  { href: '/admin', label: 'Admin' },
  { href: '/about', label: 'About' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-primary/10 transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="container mx-auto px-6 flex h-28 items-center">
        <Logo />
        <nav className="ml-12 hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'relative py-2 transition-all duration-300 hover:text-primary',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-500" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-6">
          <ThemeToggle />
          {pathname === '/' && <OrderCart />}
        </div>
      </div>
    </header>
  );
}
