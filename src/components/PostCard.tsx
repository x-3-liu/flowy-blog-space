
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Post } from '@/utils/postUtils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';

interface PostCardProps {
  post: Post;
  index?: number;
}

const PostCard = ({ post, index = 0 }: PostCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Extract first paragraph for preview
  const preview = post.content.split('\n').find(line => line.trim() !== '') || '';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // Stagger animation based on index
    
    return () => clearTimeout(timer);
  }, [index]);
  
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group p-6 rounded-2xl border border-brand-secondary/30 hover:border-brand/50",
        "bg-white/50 hover:bg-white transition-all duration-300",
        "transform hover:translate-y-[-2px] hover:shadow-lg",
        post.pinned && "ring-2 ring-brand/30 bg-white/80"
      )}
    >
      <Link to={`/${post.slug}`} className="block space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif text-brand-secondary">
            {format(post.createdAt, 'MMMM d, yyyy')}
          </span>
          <div className="flex items-center">
            {post.pinned && (
              <Pin className="h-3 w-3 text-brand mr-2" />
            )}
            <span className="text-xs font-serif text-brand-secondary">
              {post.author}
            </span>
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-serif font-semibold group-hover:text-brand transition-colors duration-300 text-balance">
          {post.title}
        </h2>
        
        <p className="text-brand-secondary text-sm line-clamp-2 text-balance font-serif">
          {preview.replace(/[#*`]/g, '')}
        </p>
        
        <div className="pt-2">
          <span className="text-xs font-serif text-brand/80 group-hover:text-brand transition-colors duration-300">
            Read more
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

export default PostCard;
