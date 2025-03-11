
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PenLine } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect py-4 px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-xl font-display font-medium tracking-tight hover:opacity-80 transition-opacity"
          >
            Flowy
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary/80",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Feed
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button asChild size="sm" className="rounded-full px-4 group">
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
