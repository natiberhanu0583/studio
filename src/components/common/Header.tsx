
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import OrderCart from '@/app/components/customer/OrderCart';

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="ml-10 hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'transition-colors hover:text-primary',
                pathname === href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {pathname === '/' && <OrderCart />}
        </div>
      </div>
    </header>
  );
}
