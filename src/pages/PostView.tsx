
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostBySlug, parseSlug } from '@/utils/postUtils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

const PostView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState(slug ? getPostBySlug(slug) : undefined);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading for a smoother transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
        <Header />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
            <div className="space-y-4 pt-10">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30">
        <Header />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-3xl font-display font-bold mb-6">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The post you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Return to Feed</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Button>
        
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-balance"
          >
            {post.title}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 opacity-70" />
              <span>{post.author}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 opacity-70" />
              <span>{format(post.createdAt, 'MMMM d, yyyy')}</span>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-6"
          >
            <div className="glass-effect p-8 rounded-2xl">
              <ReactMarkdown 
                className="markdown prose-lg max-w-none"
                remarkPlugins={[remarkGfm]}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        </motion.article>
      </main>
    </div>
  );
};

export default PostView;
