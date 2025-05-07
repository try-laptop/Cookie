import Link from 'next/link';
import { FileJson } from 'lucide-react'; // Changed icon for relevance

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <FileJson className="h-7 w-7" /> {/* Changed Icon */}
            SessionShare {/* Changed Title */}
          </Link>
          {/* Future navigation items can go here */}
        </div>
      </div>
    </header>
  );
}
