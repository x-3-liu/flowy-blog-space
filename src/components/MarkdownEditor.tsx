
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const MarkdownEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write your post content here...',
  minHeight = '300px'
}: MarkdownEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>('write');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Prevents hydration issues
  }

  return (
    <Tabs 
      defaultValue="write" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      
      <TabsContent value="write" className="mt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-sm resize-y w-full p-4 min-h-[300px]"
            style={{ minHeight }}
          />
        </motion.div>
      </TabsContent>
      
      <TabsContent value="preview" className="mt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border rounded-md p-4 min-h-[300px]"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown 
              className="markdown prose-sm md:prose"
              remarkPlugins={[remarkGfm]}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <div className="text-muted-foreground italic">
              Preview will appear here...
            </div>
          )}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};

export default MarkdownEditor;
