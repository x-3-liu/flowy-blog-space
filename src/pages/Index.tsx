
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeedPosts } from '@/utils/supabasePostUtils';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  
  // Use React Query to fetch post data
  const { 
    data: posts = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: fetchFeedPosts,
  });

  useEffect(() => {
    document.title = 'Flowy';
    // Animation for page load
    const onLoad = async () => {
      document.body.style.opacity = '0';
      await new Promise(resolve => setTimeout(resolve, 50));
      document.body.style.opacity = '1';
      document.body.style.transition = 'opacity 0.5s ease-in-out';
    };
    
    onLoad();
    
    // Cleanup
    return () => {
      document.body.style.opacity = '';
      document.body.style.transition = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/20 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-4xl font-display font-bold text-brand"
          >
            Flow
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="rounded-full border-brand-secondary text-brand hover:border-brand hover:bg-brand/5"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-6 rounded-2xl bg-white/50 border border-brand-secondary/20">
                <div className="h-6 bg-brand-secondary/20 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-brand-secondary/20 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-brand-secondary/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-brand-secondary/20 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-brand mb-4">Error loading data</h3>
            <p className="text-muted-foreground mb-6 font-serif">Please try refreshing the page</p>
            <Button onClick={() => refetch()} className="bg-brand hover:bg-brand/90 font-serif">Retry</Button>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-20"
          >
            <h3 className="text-xl font-medium text-brand-secondary mb-4 font-serif">No posts yet</h3>
            <p className="text-brand-secondary mb-6 font-serif">Be the first to share your thoughts!</p>
            <Button asChild className="bg-brand hover:bg-brand/90 font-serif">
              <a href="/new">Write a post</a>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
