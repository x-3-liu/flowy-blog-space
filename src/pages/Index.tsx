
import { useState, useEffect } from 'react';
import { getFeedPosts } from '@/utils/postUtils';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [posts, setPosts] = useState(getFeedPosts());
  const [loading, setLoading] = useState(false);

  const refreshPosts = () => {
    setLoading(true);
    // Simulate loading effect
    setTimeout(() => {
      setPosts(getFeedPosts());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/50 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl md:text-4xl font-display font-bold"
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
              onClick={refreshPosts}
              disabled={loading}
              className="rounded-full"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
        </div>
        
        {posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-20"
          >
            <h3 className="text-xl font-medium text-muted-foreground mb-4">No posts yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share your thoughts!</p>
            <Button asChild>
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
