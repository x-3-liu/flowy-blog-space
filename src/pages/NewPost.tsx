
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPost } from '@/utils/postUtils';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!author.trim()) {
      toast({
        title: "Author name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newPost = addPost({
        title,
        author,
        content,
        showInFeed
      });
      
      toast({
        title: "Post published!",
        description: "Your post has been successfully published.",
      });
      
      // Redirect to the new post
      navigate(`/${newPost.slug}`);
    } catch (error) {
      console.error("Error publishing post:", error);
      toast({
        title: "Failed to publish post",
        description: "An error occurred while publishing your post. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/30 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-2xl md:text-3xl font-display font-bold"
          >
            Create New Post
          </motion.h1>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="space-y-8 glass-effect p-8 rounded-2xl"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                placeholder="Your name..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="showInFeed"
                checked={showInFeed}
                onCheckedChange={setShowInFeed}
              />
              <Label htmlFor="showInFeed" className="cursor-pointer">
                Show in feed
              </Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Publish
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
