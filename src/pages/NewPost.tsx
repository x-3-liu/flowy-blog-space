
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { addSupabasePost } from '@/utils/supabasePostUtils';
import Header from '@/components/Header';
import MarkdownEditor from '@/components/MarkdownEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [showInFeed, setShowInFeed] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { mutate: createPost, isPending: isSubmitting } = useMutation({
    mutationFn: (postData: { title: string; author: string; content: string; showInFeed: boolean }) => {
      return addSupabasePost(postData);
    },
    onSuccess: (newPost) => {
      if (newPost) {
        toast({
          title: "文章已发布!",
          description: "您的文章已成功发布。",
        });
        
        // Redirect to the new post
        navigate(`/${newPost.slug}`);
      } else {
        toast({
          title: "发布失败",
          description: "发布文章时发生错误，请重试。",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error publishing post:", error);
      toast({
        title: "发布失败",
        description: "发布文章时发生错误，请重试。",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "标题不能为空",
        variant: "destructive",
      });
      return;
    }
    
    if (!author.trim()) {
      toast({
        title: "作者名不能为空",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "内容不能为空",
        variant: "destructive",
      });
      return;
    }
    
    createPost({ title, author, content, showInFeed });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/20 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-4 text-brand hover:text-brand/80 hover:bg-brand/5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-display font-bold text-brand"
          >
            创建新文章
          </motion.h1>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="space-y-8 bg-white/70 dark:bg-black/70 backdrop-blur-md border border-brand-secondary/20 dark:border-black/20 p-8 rounded-2xl"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">文章标题</Label>
              <Input
                id="title"
                placeholder="输入文章标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium border-brand-secondary/30 focus-visible:ring-brand"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">作者名称</Label>
              <Input
                id="author"
                placeholder="您的名字..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="border-brand-secondary/30 focus-visible:ring-brand"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="showInFeed"
                checked={showInFeed}
                onCheckedChange={setShowInFeed}
                className="data-[state=checked]:bg-brand"
              />
              <Label htmlFor="showInFeed" className="cursor-pointer">
                在首页显示
              </Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              minHeight="400px"
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-brand hover:bg-brand/90"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  发布中...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  发布
                </span>
              )}
            </Button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default NewPost;
