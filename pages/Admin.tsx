import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement, FontOption } from '../types';
import { Link, useNavigate } from 'react-router-dom';

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const navigate = useNavigate();

  // POST FORM STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Omit<Post, 'id' | 'date'>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'ARKEOLOJİ', readingTime: '5 DK'
  });

  // ANNOUNCEMENT FORM STATE
  const [annForm, setAnnForm] = useState<Omit<Announcement, 'id' | 'date'>>({
    title: '', content: '', imageUrl: '', isActive: true
  });
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const annFileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const auth = sessionStorage.getItem('tessera_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Güvenlik uyarısı: Bu passkey'i ilerde çevre değişkenlerine taşımanız önerilir.
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

  const handleOpenMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) markAsRead(msg.id);
  };

  const handleGlobalPublish = async () => {
    if (!config.githubToken) {
      alert("LÜTFEN ÖNCE GITHUB TOKEN (PAT) GİRİŞİ YAPIN.\nRoot Config sekmesini kontrol edin.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setIsPublishing(true);
    try {
      await saveToGitHub();
      alert('BAŞARILI: Veriler GitHub deposuna aktarıldı.');
    } catch (error: any) {
      alert(`KRİTİK HATA: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'author' | 'hero' | 'announcement') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const finalUrl = await uploadImageToGitHub(file);
      if (target === 'post') setPostForm(prev => ({ ...prev, imageUrl: finalUrl }));
      else if (target === 'hero') updateConfig({ heroImageUrl: finalUrl });
      else if (target === 'author') updateConfig({ authorImage: finalUrl });
      else if (target === 'announcement') setAnnForm(prev => ({ ...prev, imageUrl: finalUrl }));
    } catch (error: any) {
      alert("Yükleme hatası: " + error.message);
    } finally {
      setIsUploading(false);
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full border border-accent/20 p-12 space-y-10 bg-accent/5">
          <div className="text-center">
            <h1 className="text-xl font-black mb-2 text-accent uppercase">TESSERA_CORE</h1>
            <p className="text-mono text-[9px] opacity-30 uppercase tracking-[0.3em]">Güvenlik Protokolü v4.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PASSKEY" className="w-full bg-white/5 border border-white/10 p-4 text-center text-xs font-bold tracking-widest focus:outline-none focus:border-accent uppercase" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-accent text-white py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">EXEC_AUTH</button>
          </form>
          <div className="pt-4 text-center">
            <Link to="/" className="text-mono text-[8px] opacity-30 hover:opacity-100 hover:text-accent transition-all uppercase tracking-widest font-bold">← ANA SAYFA</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col p-8 lg:h-screen lg:sticky lg:top-0 bg-[#050505] z-[110]">
        <div className="mb-10 text-lg font-black uppercase tracking-tight italic">TESSERA <span className="text-[9px] text-accent block not-italic">v2.6 STANDALONE</span></div>
        <button onClick={handleGlobalPublish} disabled={isPublishing} className={`w-full mb-8 py-3 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all ${isPublishing ? 'opacity-30 animate-pulse' : ''}`}>
          {isPublishing ? 'SYNCING...' : 'PUSH_TO_GITHUB'}
        </button>
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-1 lg:space-x-0 lg:space-y-1 flex-grow pb-4 lg:pb-0">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV_YÖNETİMİ' },
            { id: AdminTab.ANNOUNCEMENTS, label: 'DUYURULAR' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.AUTHOR, label: 'MÜELLİF' },
            { id: AdminTab.UI_SETTINGS, label: 'SİSTEM' },
            { id: AdminTab.GITHUB, label: 'ROOT_CONFIG' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex-shrink-0 lg:w-full text-left px-5 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
              {tab.id === AdminTab.MESSAGES && config.messages.some(m => !m.read) && <span className="ml-2 w-1.5 h-1.5 bg-accent rounded-full inline-block animate-pulse"></span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl">
        <h2 className="text-2xl font-black uppercase mb-12 pb-6 border-b border-white/5 italic flex items-center">
          <span className="text-accent opacity-50 mr-4 font-mono text-xs not-italic">CMD_</span>{activeTab.replace('_', ' ')}
        </h2>

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3">ARCHIVE_COUNT</span>
              <span className="text-4xl font-black tabular-nums">{config.posts.length}</span>
            </div>
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3">NEW_MESSAGES</span>
              <span className="text-4xl font-black tabular-nums">{config.messages.filter(m => !m.read).length}</span>
            </div>
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3">ACTIVE_ANN</span>
              <span className="text-4xl font-black tabular-nums">{config.announcements.filter(a => a.isActive).length}</span>
            </div>
            <div className="border border-accent/20 p-8 bg-accent/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3">SYSTEM_STATUS</span>
              <span className="text-lg font-black block mt-2 text-accent italic uppercase animate-pulse">
                {config.githubToken ? 'Sync_Ready' : 'Setup_Required'}
              </span>
            </div>
          </div>
        )}

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-16">
            <form onSubmit={handlePostSubmit} className="space-y-8 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="ENTRY_TITLE" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase italic focus:outline-none focus:border-accent" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <select className="w-full bg-black border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option value="SANAT TARİHİ">SANAT TARİHİ</option>
                  <option value="ARKEOLOJİ">ARKEOLOJİ</option>
                  <option value="RESTORASYON">RESTORASYON</option>
                  <option value="MÜZECİLİK">MÜZECİLİK</option>
                  <option value="DİJİTALLEŞME">DİJİTALLEŞME</option>
                </select>
                <input type="text" placeholder="OKUMA SÜRESİ" className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none focus:border-accent" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
              </div>
              <textarea placeholder="FULL_CONTENT" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm focus:outline-none focus:border-accent" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent text-white py-5 text-[10px] font-black uppercase tracking-[0.4em]">{editingId ? 'UPDATE_ARCHIVE_LOG' : 'COMMIT_TO_ARCHIVE'}</button>
            </form>
            <div className="space-y-4">
              {config.posts.map(post => (
                <div key={post.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5">
                  <span className="text-sm font-black uppercase">{post.title}</span>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(post.id); setPostForm({...post}); window.scrollTo(0,0);}} className="text-[9px] font-bold text-white/40 hover:text-accent">EDIT</button>
                    <button onClick={() => deletePost(post.id)} className="text-[9px] font-bold text-red-900">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-10">
            <div className={`border p-8 space-y-8 ${config.githubToken ? 'bg-accent/5 border-accent/20' : 'bg-red-900/10 border-red-900/30'}`}>
              <h3 className="text-mono text-[10px] font-bold uppercase">GITHUB_SİSTEM_AYARLARI</h3>
              <div className="space-y-6">
                <input type="text" placeholder="GITHUB_USERNAME" className="w-full bg-black/40 border border-white/10 p-3 text-xs uppercase" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value})} />
                <input type="text" placeholder="REPO_NAME" className="w-full bg-black/40 border border-white/10 p-3 text-xs uppercase" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value})} />
                <input type="password" placeholder="PERSONAL_ACCESS_TOKEN (PAT)" className="w-full bg-black/40 border border-white/10 p-3 text-xs" value={config.githubToken} onChange={e => updateConfig({githubToken: e.target.value})} />
                <input type="email" placeholder="COMMITTER_EMAIL" className="w-full bg-black/40 border border-white/10 p-3 text-xs" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-16">
            <form onSubmit={handleAnnSubmit} className="space-y-8 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="ANN_TITLE" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase focus:outline-none" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <textarea placeholder="ANN_CONTENT" rows={3} className="w-full bg-transparent border-b border-white/10 text-sm italic focus:outline-none" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent text-white py-4 text-[10px] font-black uppercase">{editingAnnId ? 'UPDATE_ANN' : 'COMMIT_ANN'}</button>
            </form>
            <div className="space-y-4">
              {config.announcements.map(ann => (
                <div key={ann.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5">
                  <span className="text-sm font-black uppercase">{ann.title}</span>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingAnnId(ann.id); setAnnForm({...ann});}} className="text-[9px] font-bold text-white/40 hover:text-accent">EDIT</button>
                    <button onClick={() => deleteAnnouncement(ann.id)} className="text-[9px] font-bold text-red-900">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
