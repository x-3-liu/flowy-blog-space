
import { supabase } from "@/integrations/supabase/client";
import { Post, createSlug } from "./postUtils";

export interface SupabasePost {
  id: string;
  title: string;
  author: string;
  content: string;
  show_in_feed: boolean;
  created_at: string;
  slug: string;
  pinned: boolean;
  banned: boolean;
  show_header: boolean;
  comments_enabled: boolean;
}

// Transform Supabase data format to frontend format
export const mapSupabasePost = (post: SupabasePost): Post => {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    content: post.content,
    showInFeed: post.show_in_feed,
    createdAt: new Date(post.created_at),
    slug: post.slug,
    pinned: post.pinned,
    banned: post.banned,
    showHeader: post.show_header,
    commentsEnabled: post.comments_enabled
  };
};

// Fetch all posts
export const fetchAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  
  return (data as SupabasePost[]).map(mapSupabasePost);
};

// Fetch feed posts
export const fetchFeedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('show_in_feed', true)
    .eq('banned', false)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching feed posts:', error);
    return [];
  }
  
  return (data as SupabasePost[]).map(mapSupabasePost);
};

// Fetch post by slug
export const fetchPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
  
  return mapSupabasePost(data as SupabasePost);
};

// Add new post
export const addSupabasePost = async (post: Omit<Post, 'id' | 'createdAt' | 'slug' | 'pinned' | 'banned'>): Promise<Post | null> => {
  const createdAt = new Date();
  const initialSlug = createSlug(post.title, createdAt);

  const tryInsert = async (slug: string) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title: post.title,
        author: post.author,
        content: post.content,
        show_in_feed: post.showInFeed,
        show_header: post.showHeader ?? true,
        comments_enabled: post.commentsEnabled ?? false,
        slug
      }])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data: data as SupabasePost, error: null };
  }


  let currentSlug = initialSlug;
  let result = await tryInsert(currentSlug);

  while (result.error) {
      const randomNumber = Math.floor(Math.random() * 90 + 10); // Generates a random number between 10 and 99
      currentSlug = `${initialSlug}-${randomNumber}`;
      result = await tryInsert(currentSlug);
      if(!result.error){
        break;
      }
  }

    if(result.error){
        console.error('Error adding post:', result.error);
        return null;
    }


  return mapSupabasePost(result.data);
};

// Submit abuse report
export const submitAbuseReport = async (postId: string, reporterName: string, details: string): Promise<boolean> => {
  const { error } = await supabase
    .from('abuse_reports')
    .insert([{
      post_id: postId,
      reporter_name: reporterName,
      details
    }]);
  
  if (error) {
    console.error('Error submitting abuse report:', error);
    return false;
  }
  
  return true;
};

// Add comment to a post
export const addComment = async (postId: string, authorName: string, content: string): Promise<any> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      author_name: authorName,
      content
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  return data;
};

// Fetch comments for a post
export const fetchComments = async (postId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  return data;
};
