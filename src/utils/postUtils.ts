
import { format } from 'date-fns';

export interface Post {
  id: string;
  title: string;
  author: string;
  content: string;
  showInFeed: boolean;
  createdAt: Date;
  slug: string;
  pinned?: boolean;
  banned?: boolean;
  showHeader?: boolean;
  commentsEnabled?: boolean;
}

// Creates a slug from the title and date
export const createSlug = (title: string, date: Date): string => {
  // 1. Replace whitespace with hyphens *first*.  This simplifies the regex.
  let formattedTitle = title.replace(/\s+/g, '-');

  // Define a blacklist of characters to remove.  This includes most special
  // characters and emojis.  We *allow* Unicode characters (for Chinese,
  // Japanese, Korean, etc.) and hyphens.  We'll handle multiple hyphens later.
  //  Note: The \s (whitespace) is no longer needed in the blacklist.
  const blacklistRegex = /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?`~₹€£¥₩\p{Emoji}]/gu;

  // 2. Remove blacklisted characters.
  formattedTitle = formattedTitle.replace(blacklistRegex, '');


  // 3. Collapse multiple hyphens into a single hyphen.
  formattedTitle = formattedTitle.replace(/-+/g, '-');

  // 4. Remove leading and trailing hyphens
  formattedTitle = formattedTitle.replace(/^-+|-+$/g, '');

  const day = format(date, 'dd');
  const month = format(date, 'MM');
  const year = format(date, 'yyyy');

  return `${formattedTitle}-${day}-${month}-${year}`;
};

// Store posts in localStorage
export const savePosts = (posts: Post[]): void => {
  localStorage.setItem('blog_posts', JSON.stringify(posts));
};

// Get posts from localStorage
export const getPosts = (): Post[] => {
  const posts = localStorage.getItem('blog_posts');
  if (!posts) return [];
  
  return JSON.parse(posts).map((post: any) => ({
    ...post,
    createdAt: new Date(post.createdAt)
  }));
};

// Add a new post
export const addPost = (post: Omit<Post, 'id' | 'createdAt' | 'slug'>): Post => {
  const posts = getPosts();
  const createdAt = new Date();
  const id = `post_${Date.now()}`;
  const slug = createSlug(post.title, createdAt);
  
  const newPost: Post = {
    ...post,
    id,
    createdAt,
    slug
  };
  
  savePosts([newPost, ...posts]);
  return newPost;
};

// Get a post by slug
export const getPostBySlug = (slug: string): Post | undefined => {
  const posts = getPosts();
  return posts.find(post => post.slug === slug);
};

// Get a list of posts for the feed
export const getFeedPosts = (): Post[] => {
  const posts = getPosts();
  return posts.filter(post => post.showInFeed)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
