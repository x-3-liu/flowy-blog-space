
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeedPosts, migrateLocalStoragePosts } from '@/utils/supabasePostUtils';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  
  useEffect(() => {
    // 检查是否需要迁移数据
    const checkAndMigrateData = async () => {
      const hasMigrated = localStorage.getItem('has_migrated_to_supabase');
      
      if (!hasMigrated && localStorage.getItem('blog_posts')) {
        setIsMigrating(true);
        toast({
          title: "正在迁移数据",
          description: "正在将本地数据迁移到数据库，请稍候...",
        });
        
        const success = await migrateLocalStoragePosts();
        
        if (success) {
          localStorage.setItem('has_migrated_to_supabase', 'true');
          toast({
            title: "数据迁移成功",
            description: "本地数据已成功迁移到数据库。",
          });
        } else {
          toast({
            title: "数据迁移失败",
            description: "迁移过程中出现错误，请刷新页面重试。",
            variant: "destructive",
          });
        }
        setIsMigrating(false);
        refetch();
      }
    };
    
    checkAndMigrateData();
  }, []);

  // 使用 React Query 获取文章数据
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
              disabled={isLoading || isMigrating}
              className="rounded-full border-brand-secondary text-brand hover:border-brand hover:bg-brand/5"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${(isLoading || isMigrating) ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </motion.div>
        </div>
        
        {isLoading || isMigrating ? (
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
            <h3 className="text-xl font-medium text-brand mb-4">获取数据时出错</h3>
            <p className="text-muted-foreground mb-6">请尝试刷新页面</p>
            <Button onClick={() => refetch()} className="bg-brand hover:bg-brand/90">重试</Button>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-20"
          >
            <h3 className="text-xl font-medium text-brand-secondary mb-4">暂无文章</h3>
            <p className="text-brand-secondary mb-6">成为第一个分享想法的人！</p>
            <Button asChild className="bg-brand hover:bg-brand/90">
              <a href="/new">写一篇文章</a>
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
