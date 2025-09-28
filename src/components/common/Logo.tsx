import { Coffee } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Coffee className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tight">
        Shega Cafe
      </span>
    </Link>
  );
}
