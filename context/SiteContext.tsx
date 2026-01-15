
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
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// UTF-8 uyumlu Base64 encode (Türkçe karakterler için güvenli)
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

  const setGithubToken = (token: string) => {
    setGithubTokenState(token);
    localStorage.setItem('tessera_secure_token', token);
  };

  useEffect(() => {
    localStorage.setItem('tessera_v2_config', JSON.stringify(config));
  }, [config]);

  const refreshFromGitHub = useCallback(async (force: boolean = false) => {
    if (!config.githubUsername || !config.githubRepo) return;
    
    // Admin panelindeysek ve zorunlu değilse otomatik çekme yapma (çalışmaların silinmemesi için)
    const isAdmin = window.location.hash.includes('/admin');
    const isVisitor = !githubToken;

    // Ziyaretçiler her zaman en güncel veriyi çekmeli, Admin ise sadece istediğinde.
    if (!isVisitor && !force && isAdmin) return;

    try {
      // ?t= timestamp ekleyerek GitHub cache mekanizmasını atlatıyoruz
      const url = `https://raw.githubusercontent.com/${config.githubUsername}/${config.githubRepo}/main/data/config.json?t=${Date.now()}`;
      const response = await fetch(url, { cache: 'no-store' });
      
      if (response.ok) {
        const remoteData = await response.json();
        
        setConfig(prev => {
          // Gelen mesajları yerel mesajlarla birleştir (ileti kaybını önlemek için)
          const remoteMsgs = remoteData.messages || [];
          const localMsgs = prev.messages || [];
          const mergedMessages = [...remoteMsgs];
          
          localMsgs.forEach(lm => {
            if (!mergedMessages.find(rm => rm.id === lm.id)) {
              mergedMessages.push(lm);
            }
          });

          return { 
            ...remoteData, 
            messages: mergedMessages,
            // Bağlantı ayarlarını yerelden koru
            githubUsername: prev.githubUsername,
            githubRepo: prev.githubRepo,
            githubEmail: prev.githubEmail
          };
        });
        console.log("Tessera Cloud: Veriler başarıyla GitHub'dan senkronize edildi.");
      }
    } catch (e) {
      console.warn("Tessera Cloud: Sunucuya erişilemedi, yerel önbellek kullanılıyor.");
    }
  }, [config.githubUsername, config.githubRepo, githubToken]);

  // Sayfa ilk yüklendiğinde veriyi buluttan çek
  useEffect(() => {
    refreshFromGitHub();
  }, []);

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
    setConfig(prev => ({ ...prev, announcements: [newAnn, ...(prev.announcements || [])] }));
  }, []);

  const updateAnnouncement = useCallback((id: string, updates: Partial<Announcement>) => {
    setConfig(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setConfig(prev => ({ ...prev, announcements: (prev.announcements || []).filter(a => a.id !== id) }));
  }, []);

  const addMessage = useCallback((msgData: Omit<Message, 'id' | 'receivedAt' | 'read'>) => {
    const newMessage: Message = {
      ...msgData,
      id: Math.random().toString(36).substr(2, 9),
      receivedAt: new Date().toLocaleString('tr-TR'),
      read: false
    };
    setConfig(prev => ({ ...prev, messages: [newMessage, ...(prev.messages || [])] }));
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
    if (!githubToken) throw new Error('GitHub PAT Token eksik.');
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

    if (!res.ok) throw new Error('Görsel yükleme başarısız.');
    return `https://raw.githubusercontent.com/${config.githubUsername}/${config.githubRepo}/main/${path}`;
  }, [config, githubToken]);

  const saveToGitHub = useCallback(async () => {
    if (!githubToken) throw new Error('GitHub Token bulunamadı. Lütfen ROOT_CONFIG sekmesine gidin.');
    
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
        message: 'Tessera Sync: Site Update',
        content: jsonContent,
        sha: sha || undefined
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Buluta gönderme işlemi başarısız.');
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
  if (!context) throw new Error('SiteProvider bulunamadı.');
  return context;
};
