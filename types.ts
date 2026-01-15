
export type FontOption = 'Inter' | 'Space Grotesk' | 'JetBrains Mono' | 'Playfair Display';

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  date: string;
  category: string;
  readingTime: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  receivedAt: string;
  read: boolean;
}

export interface FocusArea {
  id: string;
  title: string;
  desc: string;
}

export interface SiteConfig {
  siteTitle: string;
  accentColor: string;
  fontFamily: FontOption;
  heroText: string;
  heroSubtext: string;
  heroImageUrl: string;
  authorName: string;
  authorTitle: string;
  authorBio: string;
  authorImage: string;
  authorPhilosophy: string;
  focusAreas: FocusArea[];
  githubUsername: string;
  githubEmail: string;
  githubToken: string;
  githubRepo: string;
  githubImagePath: string;
  githubProjects: GitHubProject[];
  socialLinks: {
    instagram: string;
    linkedin: string;
  };
  posts: Post[];
  announcements: Announcement[];
  messages: Message[];
}

export enum AdminTab {
  OVERVIEW = 'overview',
  POSTS = 'posts',
  ANNOUNCEMENTS = 'announcements',
  MESSAGES = 'messages',
  UI_SETTINGS = 'ui_settings',
  GITHUB = 'github',
  AUTHOR = 'author'
}
