import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPostBySlug, fetchComments, addComment, submitAbuseReport } from '@/utils/supabasePostUtils';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Flag, Copy } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/use-toast';
import remarkBreaks from 'remark-breaks';
import remarkEmoji from 'remark-emoji';
import rehypePrism from 'rehype-prism-plus';
import 'katex/dist/katex.min.css';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PostView = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [reportName, setReportName] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPostBySlug(slug || ''),
    enabled: !!slug,
  });

  const {
    data: comments = [],
    isLoading: isCommentsLoading
  } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: () => fetchComments(post?.id || ''),
    enabled: !!post?.id && !!post.commentsEnabled,
  });

  useEffect(() => {
    if (post && !isPostLoading && !isPostError) {
      document.title = `${post.title} - Flowy`;
    }
  }, [post, isPostLoading, isPostError]);

  const addCommentMutation = useMutation({
    mutationFn: (data: { postId: string; authorName: string; content: string }) => {
      return addComment(data.postId, data.authorName, data.content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] });
      setCommentAuthor('');
      setCommentContent('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add comment",
        description: "There was an error posting your comment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const reportAbuseMutation = useMutation({
    mutationFn: (data: { postId: string; reporterName: string; details: string }) => {
      return submitAbuseReport(data.postId, data.reporterName, data.details);
    },
    onSuccess: () => {
      setReportDialogOpen(false);
      setReportName('');
      setReportDetails('');
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We will review it shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to submit report",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) {
      toast({
        title: "Both name and comment are required",
        variant: "destructive",
      });
      return;
    }

    addCommentMutation.mutate({
      postId: post?.id || '',
      authorName: commentAuthor,
      content: commentContent
    });
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName.trim() || !reportDetails.trim()) {
      toast({
        title: "Both name and details are required",
        variant: "destructive",
      });
      return;
    }

    reportAbuseMutation.mutate({
      postId: post?.id || '',
      reporterName: reportName,
      details: reportDetails
    });
  };

  const handleCopyClick = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "There was a problem copying the text.",
        variant: "destructive",
      });
    });
  }, [toast]);

    const components = {
        code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match && match[1] ? match[1] : '';
            const codeId = `code-${Math.random().toString(36).substring(7)}`;
            const hasCopied = copyStates[codeId];

            if (!inline) {
                return (
                    <div className="relative bg-white/80 dark:bg-black/90 rounded-md my-4 overflow-hidden font-mono text-sm">
                        <div className="flex items-center justify-end absolute top-0 right-0 p-2">
                            {lang && (
                                <span className="text-brand-secondary text-xs mr-2 font-mono uppercase">{lang}</span>
                            )}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopyClick(String(children).replace(/\n$/, ''), codeId)}
                                            className="text-brand-secondary hover:text-brand"
                                        >
                                            {hasCopied ? (
                                                <span className="text-xs">Copied!</span>
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{hasCopied ? "Copied!" : "Copy to Clipboard"}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {/* Directly modify the existing pre tag */}
                        <pre
                            {...props} // Spread all props from rehype-prism-plus
                            className={cn(
                                "p-4 mt-0 rounded-md",
                                className,
                                "bg-transparent !important", // Override background
                                "text-foreground !important"  // Override text color
                            )}
                        >
                            <code className={className}>{children}</code>
                        </pre>
                    </div>
                );
            }

            // Inline code (no change needed)
            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };



  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/20">
        <Header />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-8 w-full">
            <div className="h-8 bg-brand-secondary/30 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-brand-secondary/30 rounded w-1/4 mx-auto"></div>
            <div className="space-y-4 pt-10">
              <div className="h-4 bg-brand-secondary/30 rounded"></div>
              <div className="h-4 bg-brand-secondary/30 rounded"></div>
              <div className="h-4 bg-brand-secondary/30 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPostError || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/20">
        <Header />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-6 text-brand">Post not found</h1>
          <p className="text-brand-secondary mb-8 font-serif">The post you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="bg-brand hover:bg-brand/90 font-serif">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (post.banned) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/20">
        {post.showHeader && <Header />}
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-6 text-brand">Content Unavailable</h1>
          <p className="text-brand-secondary mb-8 font-serif">This post has been removed due to violations of community guidelines.</p>
          <Button asChild className="bg-brand hover:bg-brand/90 font-serif">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-bg to-brand-secondary/10 dark:from-background dark:to-background/80">
      {post.showHeader && <Header />}

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-8 group text-brand hover:text-brand/80 hover:bg-brand/5 font-serif"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
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
            className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-balance text-foreground"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 text-sm text-brand-secondary font-serif"
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
            <div className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-brand-secondary/20 dark:border-black/20 p-8 rounded-2xl">
              <ReactMarkdown
                className="markdown prose-lg max-w-none text-foreground font-serif"
                remarkPlugins={[
                  remarkGfm,
                  remarkBreaks,
                  remarkMath,
                  remarkEmoji,
                ]}
                rehypePlugins={[
                  [rehypeKatex, { /* ... */ }],
                  [rehypePrism, {
                    theme: 'tomorrow',
                    ignoreMissing: true
                  }],
                ]}
                components={components}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </motion.div>

          {post.commentsEnabled && (
            <div className="mt-12">
              <h3 className="text-xl font-serif font-semibold mb-6 text-foreground">Comments</h3>

              <div className="space-y-8 mb-10">
                {isCommentsLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-brand-secondary/30 rounded w-1/4"></div>
                    <div className="h-12 bg-brand-secondary/20 rounded"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-brand-secondary font-serif">No comments yet.  Be the first to share your thoughts!</p>
                ) : (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="border-l-2 border-brand-secondary/20 pl-4 py-1">
                      <div className="flex items-center mb-2">
                        <span className="font-serif font-medium text-foreground">{comment.author_name}</span>
                        <span className="ml-4 text-xs text-brand-secondary">
                          {format(new Date(comment.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <ReactMarkdown
                        className="markdown prose-sm max-w-none text-foreground font-serif"
                        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkBreaks]}
                        rehypePlugins={[
                          [rehypeKatex, {
                            errorColor: '#cc0000',
                            onError: (error) => {
                              console.error('KaTeX error:', error);
                              return `<span>Error rendering formula</span>`;
                            }
                          }],
                          [rehypePrism, { ignoreMissing: true }],
                        ]}
                        components={components}

                      >
                        {comment.content}
                      </ReactMarkdown>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitComment} className="bg-white/70 dark:bg-black/70 backdrop-blur-md border border-brand-secondary/20 dark:border-black/20 p-6 rounded-xl">
                <h4 className="text-lg font-serif font-medium mb-4 text-foreground">Add a comment</h4>

                <div className="space-y-4">
                  <Input
                    placeholder="Your name"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="font-serif"
                  />

                  <Textarea
                    placeholder="Your comment (Markdown supported)"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    className="font-serif"
                  />

                  <Button
                    type="submit"
                    className="bg-brand hover:bg-brand/90 font-serif"
                    disabled={addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.article>

        <div className="mt-16">
          <Separator className="my-6" />

          <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center text-xs text-brand-secondary hover:text-brand transition-colors font-serif">
                <Flag className="h-3 w-3 mr-1" />
                Report abuse
              </button>
            </DialogTrigger>

            <DialogContent className="font-serif">
              <DialogHeader>
                <DialogTitle>Report Abuse</DialogTitle>
                <DialogDescription>
                  Please provide details about why you're reporting this content.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitReport} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="reporter-name" className="text-sm">Your name</label>
                  <Input
                    id="reporter-name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="report-details" className="text-sm">Details</label>
                  <Textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please provide details about the issue"
                    rows={4}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-brand hover:bg-brand/90"
                    disabled={reportAbuseMutation.isPending}
                  >
                    {reportAbuseMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default PostView;