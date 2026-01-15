import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig, Post, Message, Announcement } from '../types';
import { INITIAL_CONFIG } from '../constants';

interface SiteContextType {
  config: SiteConfig;
  githubToken: string;
  setGithubToken: (token: string) => void;
  updateConfig: (updates: Partial<SiteConfig>) => void;
  addPost: (post: Omit<Post, 'id' | 'date'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addMessage: (msg: Omit<Message, 'id' | 'receivedAt' | 'read'>) => void;
  deleteMessage: (id: string) => void;
  markAsRead: (id: string) => void;
  saveToGitHub: () => Promise<void>;
  uploadImageToGitHub: (file: File) => Promise<string>;
  refreshFromGitHub: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const toBase64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('tessera_v2_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [githubToken, setGithubTokenState] = useState<string>(() => {
    return localStorage.getItem('tessera_secure_token') || '';
  });

  const refreshFromGitHub = useCallback(async () => {
    if (!config.githubUsername || !config.githubRepo) return;
    try {
      // Önbelleği (cache) kırmak için timestamp ve no-store kullanıyoruz
      const url = `https://raw.githubusercontent.com/${config.githubUsername}/${config.githubRepo}/main/data/config.json?t=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const remoteData = await response.json();
        // Token güvenliği: Gelen veride token varsa temizle
        if (remoteData.githubToken) delete remoteData.githubToken;
        setConfig(prev => ({ ...remoteData }));
        console.log("Tessera Sync: Data pulled from GitHub.");
      }
    } catch (e) {
      console.warn("Tessera Sync: Remote data could not be reached.");
    }
  }, [config.githubUsername, config.githubRepo]);

  useEffect(() => {
    refreshFromGitHub();
  }, []);

  useEffect(() => {
    localStorage.setItem('tessera_v2_config', JSON.stringify(config));
  }, [config]);

  const setGithubToken = (token: string) => {
    setGithubTokenState(token);
    localStorage.setItem('tessera_secure_token', token);
  };

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const addPost = useCallback((postData: Omit<Post, 'id' | 'date'>) => {
    const newPost: Post = {
      ...postData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    };
    setConfig(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setConfig(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const deletePost = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
  }, []);

  const addAnnouncement = useCallback((annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    };
    setConfig(prev => ({ ...prev, announcements: [newAnn, ...prev.announcements] }));
  }, []);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    setConfig(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, announcements: prev.announcements.filter(a => a.id !== id) }));
  }, []);

  const addMessage = useCallback((msgData: Omit<Message, 'id' | 'receivedAt' | 'read'>) => {
    const newMessage: Message = {
      ...msgData,
      id: Math.random().toString(36).substr(2, 9),
      receivedAt: new Date().toLocaleString('tr-TR'),
      read: false
    };
    setConfig(prev => ({ ...prev, messages: [newMessage, ...prev.messages] }));
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== id) }));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, read: true } : m)
    }));
  }, []);

  const uploadImageToGitHub = useCallback(async (file: File): Promise<string> => {
    if (!githubToken) throw new Error('Token eksik.');
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const base64Content = await base64Promise;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const path = `${config.githubImagePath}/${fileName}`;
    const url = `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}/contents/${path}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Upload: ${fileName}`,
        content: base64Content
      }),
    });

    if (!response.ok) throw new Error('Yükleme hatası.');
    return `https://raw.githubusercontent.com/${config.githubUsername}/${config.githubRepo}/main/${path}`;
  }, [config, githubToken]);

  const saveToGitHub = useCallback(async () => {
    if (!githubToken) throw new Error('GitHub PAT eksik.');

    // KESİN ÇÖZÜM: Gönderilen veriden ghp_ içeren her şeyi temizle
    const configToSave = JSON.parse(JSON.stringify(config));
    
    const cleanObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].includes('ghp_')) {
          obj[key] = ""; // Token değerini boşalt
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanObject(obj[key]);
        }
      }
    };
    cleanObject(configToSave);
    if (configToSave.githubToken) delete configToSave.githubToken;

    const jsonString = JSON.stringify(configToSave, null, 2);
    const jsonContent = toBase64(jsonString);
    const path = 'data/config.json';
    const url = `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}/contents/${path}`;
    
    let sha = '';
    try {
      const getRes = await fetch(url, { headers: { 'Authorization': `token ${githubToken}` } });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch (e) {}

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Sync: Tessera Cloud Update',
        content: jsonContent,
        sha: sha || undefined
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Push hatası.');
    }
  }, [config, githubToken]);

  return (
    <SiteContext.Provider value={{ 
      config, githubToken, setGithubToken, updateConfig, addPost, updatePost, deletePost, 
      addAnnouncement, updateAnnouncement, deleteAnnouncement, 
      addMessage, deleteMessage, markAsRead, saveToGitHub, uploadImageToGitHub, refreshFromGitHub 
    }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite error');
  return context;
};
