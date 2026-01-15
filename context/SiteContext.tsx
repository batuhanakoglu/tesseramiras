
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
  refreshFromGitHub: (force?: boolean) => Promise<void>;
  isDirty: boolean; // Yerel değişiklik var mı kontrolü
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const toBase64 = (str: string) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [isDirty, setIsDirty] = useState(false);
  const [githubToken, setGithubTokenState] = useState<string>(() => localStorage.getItem('tessera_secure_token') || '');

  const setGithubToken = (token: string) => {
    setGithubTokenState(token);
    localStorage.setItem('tessera_secure_token', token);
  };

  // Uygulama ilk açıldığında BULUTTAN veriyi çek (En kritik yer burası)
  useEffect(() => {
    const initFetch = async () => {
      const isAdmin = window.location.hash.includes('/admin');
      const savedLocal = localStorage.getItem('tessera_v2_config');
      
      // Eğer kullanıcı Admin değilse, yerel hafızayı temizle ve buluttan çek
      if (!isAdmin) {
        await refreshFromGitHub(true);
      } else if (savedLocal) {
        // Admin ise yereldeki çalışmasını yükle
        setConfig(JSON.parse(savedLocal));
      } else {
        await refreshFromGitHub(true);
      }
    };
    initFetch();
  }, []);

  // Config her değiştiğinde yerel hafızayı güncelle
  useEffect(() => {
    localStorage.setItem('tessera_v2_config', JSON.stringify(config));
  }, [config]);

  const refreshFromGitHub = useCallback(async (force: boolean = false) => {
    // URL'yi temizle (Önceki verilere takılma)
    const user = config.githubUsername || 'batuhanakoglu';
    const repo = config.githubRepo || 'tesseramiras';
    
    try {
      // ?t= ekleyerek GitHub Cache'i bypass ediyoruz
      const url = `https://raw.githubusercontent.com/${user}/${repo}/main/data/config.json?t=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store' });
      
      if (response.ok) {
        const remoteData = await response.json();
        setConfig(remoteData);
        setIsDirty(false);
        console.log("Tessera: Cloud Data Synced Successfully.");
      }
    } catch (e) {
      console.error("Tessera Sync Error:", e);
    }
  }, [config.githubUsername, config.githubRepo]);

  const updateConfig = useCallback((updates: Partial<SiteConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const addPost = useCallback((postData: Omit<Post, 'id' | 'date'>) => {
    const newPost: Post = {
      ...postData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    };
    setConfig(prev => ({ ...prev, posts: [newPost, ...prev.posts] }));
    setIsDirty(true);
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<Post>) => {
    setConfig(prev => ({
      ...prev,
      posts: prev.posts.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    setIsDirty(true);
  }, []);

  const deletePost = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
    setIsDirty(true);
  }, []);

  const addAnnouncement = useCallback((annData: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    };
    setConfig(prev => ({ ...prev, announcements: [newAnn, ...(prev.announcements || [])] }));
    setIsDirty(true);
  }, []);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    setConfig(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    setIsDirty(true);
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, announcements: (prev.announcements || []).filter(a => a.id !== id) }));
    setIsDirty(true);
  }, []);

  const addMessage = useCallback((msgData: Omit<Message, 'id' | 'receivedAt' | 'read'>) => {
    const newMessage: Message = {
      ...msgData,
      id: Math.random().toString(36).substr(2, 9),
      receivedAt: new Date().toLocaleString('tr-TR'),
      read: false
    };
    setConfig(prev => ({ ...prev, messages: [newMessage, ...(prev.messages || [])] }));
    setIsDirty(true);
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== id) }));
    setIsDirty(true);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === id ? { ...m, read: true } : m)
    }));
    setIsDirty(true);
  }, []);

  const uploadImageToGitHub = useCallback(async (file: File): Promise<string> => {
    if (!githubToken) throw new Error('PAT Token eksik.');
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    const base64Content = await base64Promise;
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const path = `${config.githubImagePath}/${fileName}`;
    const url = `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}/contents/${path}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `Upload image: ${fileName}`, content: base64Content }),
    });

    if (!res.ok) throw new Error('Yükleme başarısız.');
    return `https://raw.githubusercontent.com/${config.githubUsername}/${config.githubRepo}/main/${path}`;
  }, [config, githubToken]);

  const saveToGitHub = useCallback(async () => {
    if (!githubToken) throw new Error('GitHub PAT Token eksik.');
    const jsonString = JSON.stringify(config, null, 2);
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

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Sync: Global Configuration Update',
        content: jsonContent,
        sha: sha || undefined
      }),
    });

    if (!res.ok) throw new Error('Buluta yükleme başarısız.');
    setIsDirty(false); // Kayıt başarılı, yerel fark kapandı
  }, [config, githubToken]);

  return (
    <SiteContext.Provider value={{ 
      config, githubToken, setGithubToken, updateConfig, addPost, updatePost, deletePost, 
      addAnnouncement, updateAnnouncement, deleteAnnouncement, 
      addMessage, deleteMessage, markAsRead, saveToGitHub, uploadImageToGitHub, refreshFromGitHub,
      isDirty
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
