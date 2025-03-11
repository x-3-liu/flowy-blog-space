
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { addSupabasePost } from '@/utils/supabasePostUtils';
import Header from '@/components/Header';
import { Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { mutate: createPost, isPending: isSubmitting } = useMutation({
    mutationFn: (postData: { title: string; author: string; content: string; showInFeed: boolean }) => {
      return addSupabasePost(postData);
    },
    onSuccess: (newPost) => {
      if (newPost) {
        toast({
          title: "Post published!",
          description: "Your post has been successfully published.",
        });
        
        // Redirect to the new post
        navigate(`/${newPost.slug}`);
      } else {
        toast({
          title: "Publication failed",
          description: "An error occurred while publishing your post. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error publishing post:", error);
      toast({
        title: "Publication failed",
        description: "An error occurred while publishing your post. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (!author.trim()) {
      toast({
        title: "Author name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    createPost({ 
      title, 
      author, 
      content, 
      showInFeed: visibility === 'public' 
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/10 dark:from-background dark:to-background/80">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-brand hover:text-brand/80 hover:bg-brand/5 flex items-center text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="space-y-8"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-serif font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-brand placeholder:text-brand/40"
          />
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="flex-1 text-sm font-serif bg-transparent border-none focus:outline-none focus:ring-0 text-brand-secondary placeholder:text-brand-secondary/40"
            />
            
            <div className="w-2/10">
              <Select
                value={visibility}
                onValueChange={setVisibility}
              >
                <SelectTrigger className="bg-transparent border-none focus:ring-0 text-sm font-serif text-brand-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public" className="font-serif">Public</SelectItem>
                  <SelectItem value="private" className="font-serif">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <textarea
            placeholder="Write here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[calc(100vh-350px)] bg-transparent border-none focus:outline-none focus:ring-0 text-brand-secondary font-serif placeholder:text-brand-secondary/40 resize-none"
          />
          
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand/90 transition-colors font-serif flex items-center"
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
            </button>
          </div>
        </motion.form>
      </main>
    </div>
  );
};

export default NewPost;
