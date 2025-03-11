
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
}

// 转换 Supabase 返回的数据格式为前端使用的格式
export const mapSupabasePost = (post: SupabasePost): Post => {
  return {
    id: post.id,
    title: post.title,
    author: post.author,
    content: post.content,
    showInFeed: post.show_in_feed,
    createdAt: new Date(post.created_at),
    slug: post.slug
  };
};

// 获取所有文章
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

// 获取 feed 中的文章
export const fetchFeedPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('show_in_feed', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching feed posts:', error);
    return [];
  }
  
  return (data as SupabasePost[]).map(mapSupabasePost);
};

// 通过 slug 获取文章
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

// 添加新文章
export const addSupabasePost = async (post: Omit<Post, 'id' | 'createdAt' | 'slug'>): Promise<Post | null> => {
  const createdAt = new Date();
  const slug = createSlug(post.title, createdAt);
  
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      title: post.title,
      author: post.author,
      content: post.content,
      show_in_feed: post.showInFeed,
      slug
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding post:', error);
    return null;
  }
  
  return mapSupabasePost(data as SupabasePost);
};

// 迁移 localStorage 数据到 Supabase (仅在第一次运行时使用)
export const migrateLocalStoragePosts = async (): Promise<boolean> => {
  const localStoragePosts = localStorage.getItem('blog_posts');
  
  if (!localStoragePosts) {
    return false;
  }
  
  try {
    const posts = JSON.parse(localStoragePosts);
    
    for (const post of posts) {
      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title: post.title,
          author: post.author,
          content: post.content,
          show_in_feed: post.showInFeed,
          created_at: post.createdAt,
          slug: post.slug
        }])
        .single();
      
      if (error && error.code !== '23505') { // Ignore unique violation errors (duplicate slugs)
        console.error('Error migrating post:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error parsing localStorage posts:', error);
    return false;
  }
};
