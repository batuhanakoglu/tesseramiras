import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement } from '../types';
import { useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    addPost, 
    updatePost, 
    deletePost, 
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    deleteMessage, 
    markAsRead, 
    saveToGitHub, 
    uploadImageToGitHub 
  } = useSite();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Omit<Post, 'id' | 'date'>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'ARKEOLOJİ', readingTime: '5 DK'
  });

  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<Omit<Announcement, 'id' | 'date'>>({
    title: '', content: '', imageUrl: '', isActive: true
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('tessera_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1196559621') {
      setIsAuthenticated(true);
      sessionStorage.setItem('tessera_auth', 'true');
    } else {
      alert('ERİŞİM REDDEDİLDİ');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tessera_auth');
    navigate('/');
  };

  const handleGlobalPublish = async () => {
    if (!config.githubToken) {
      alert("HATA: GitHub Token eksik! ROOT_CONFIG sekmesine gidin.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setIsPublishing(true);
    try {
      await saveToGitHub();
      alert('BAŞARILI: Veriler GitHub’a aktarıldı.');
    } catch (error: any) {
      alert(`HATA: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updatePost(editingId, postForm);
      setEditingId(null);
    } else {
      addPost(postForm);
    }
    setPostForm({ title: '', excerpt: '', content: '', imageUrl: '', category: 'ARKEOLOJİ', readingTime: '5 DK' });
  };

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnId) {
      updateAnnouncement(editingAnnId, annForm);
      setEditingAnnId(null);
    } else {
      addAnnouncement(annForm);
    }
    setAnnForm({ title: '', content: '', imageUrl: '', isActive: true });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PASSKEY" className="w-full bg-white/5 border border-white/10 p-4 text-center focus:outline-none focus:border-accent" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-accent py-4 text-[9px] font-black uppercase tracking-widest">GİRİŞ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase text-accent">TESSERA</div>
        <button onClick={handleGlobalPublish} disabled={isPublishing} className="w-full mb-8 py-3 border border-accent/30 text-accent text-[9px] font-black hover:bg-accent hover:text-white transition-all">
          {isPublishing ? 'YAYINLANIYOR...' : 'GITHUB_YAYINLA'}
        </button>
        <nav className="space-y-1 flex-grow">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV' },
            { id: AdminTab.ANNOUNCEMENTS, label: 'DUYURULAR' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.AUTHOR, label: 'MÜELLİF' },
            { id: AdminTab.GITHUB, label: 'ROOT_CONFIG' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-4 text-red-900 text-[9px] font-black text-left">CIKIŞ YAP</button>
      </aside>

      <main className="flex-grow p-12 overflow-y-auto">
        <h2 className="text-2xl font-black uppercase mb-12 italic border-b border-white/5 pb-6">CMD_{activeTab}</h2>

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12">
            <form onSubmit={handlePostSubmit} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="BAŞLIK" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase focus:outline-none" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <textarea placeholder="İÇERİK" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm focus:outline-none" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase">{editingId ? 'GÜNCELLE' : 'EKLE'}</button>
            </form>
            <div className="space-y-4">
              {config.posts.map(post => (
                <div key={post.id} className="flex justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-xs font-bold uppercase">{post.title}</span>
                  <div className="flex gap-4">
                    <button onClick={() => {setEditingId(post.id); setPostForm({...post}); window.scrollTo(0,0);}} className="text-accent text-[9px]">DÜZENLE</button>
                    <button onClick={() => deletePost(post.id)} className="text-red-900 text-[9px]">SİL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-12">
            <form onSubmit={handleAnnSubmit} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="DUYURU BAŞLIĞI" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase focus:outline-none" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <textarea placeholder="İÇERİK" rows={3} className="w-full bg-transparent border-b border-white/10 text-sm italic" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase">{editingAnnId ? 'GÜNCELLE' : 'YAYINLA'}</button>
            </form>
            <div className="space-y-4">
              {config.announcements.map(ann => (
                <div key={ann.id} className="flex justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-xs font-bold uppercase">{ann.title}</span>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="text-red-900 text-[9px]">SİL</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-2">
              {config.messages.map(msg => (
                <button key={msg.id} onClick={() => {setSelectedMessage(msg); markAsRead(msg.id);}} className={`w-full text-left p-4 border ${selectedMessage?.id === msg.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5'}`}>
                  <h4 className="text-xs font-black uppercase truncate">{msg.subject}</h4>
                  <p className="text-[8px] opacity-50 uppercase">{msg.senderName}</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-8 bg-white/5 border border-white/5 p-8 min-h-[300px]">
              {selectedMessage ? (
                <div>
                  <h3 className="text-xl font-black mb-4 uppercase">{selectedMessage.subject}</h3>
                  <p className="text-sm italic text-white/70 whitespace-pre-wrap">{selectedMessage.body}</p>
                  <button onClick={() => {deleteMessage(selectedMessage.id); setSelectedMessage(null);}} className="mt-8 text-red-900 text-[9px] font-bold">MESAJI SİL</button>
                </div>
              ) : <p className="opacity-20 uppercase text-[10px]">Mesaj seçin.</p>}
            </div>
          </div>
        )}

        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black opacity-30">MÜELLİF İSMİ</label>
              <input type="text" className="w-full bg-transparent border-b border-white/10 py-2 font-black uppercase" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black opacity-30">BİYOGRAFİ</label>
              <textarea rows={5} className="w-full bg-transparent border border-white/10 p-4 text-sm italic" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
            </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-xl space-y-6 bg-white/5 p-8 border border-white/10">
            <h3 className="text-accent text-[10px] font-black uppercase">GİTHUB_BAĞLANTI_AYARLARI</h3>
            <div className="space-y-4">
              <input type="text" placeholder="USERNAME" className="w-full bg-black border border-white/10 p-3 text-xs" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value})} />
              <input type="text" placeholder="REPO" className="w-full bg-black border border-white/10 p-3 text-xs" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value})} />
              <input type="password" placeholder="TOKEN (PAT)" className="w-full bg-black border border-white/10 p-3 text-xs" value={config.githubToken} onChange={e => updateConfig({githubToken: e.target.value})} />
              <input type="email" placeholder="EMAIL" className="w-full bg-black border border-white/10 p-3 text-xs" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value})} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
