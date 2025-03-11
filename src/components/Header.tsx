
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-brand-secondary/20 dark:border-black/20 py-4 px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-xl font-serif font-medium tracking-tight text-brand hover:opacity-80 transition-opacity"
          >
            Flowy
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-serif transition-colors hover:text-brand/80",
                location.pathname === "/" ? "text-brand" : "text-brand-secondary"
              )}
            >
              Home
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button asChild size="sm" className="rounded-full px-4 group bg-brand hover:bg-brand/90 font-serif">
            <Link to="/new" className="flex items-center space-x-2">
              <PenLine className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Write</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
