import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement, FontOption } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { 
    config, updateConfig, addPost, updatePost, deletePost, 
    addAnnouncement, updateAnnouncement, deleteAnnouncement,
    deleteMessage, markAsRead, saveToGitHub, uploadImageToGitHub 
  } = useSite();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [syncError, setSyncError] = useState<string | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (sessionStorage.getItem('tessera_auth') === 'true') setIsAuthenticated(true);
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

  const handleGlobalPublish = async () => {
    setSyncStatus('SYNCING');
    setSyncError(null);
    try {
      await saveToGitHub();
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    } catch (error: any) {
      setSyncStatus('ERROR');
      setSyncError(error.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToGitHub(file);
      if (target === 'post') setPostForm(prev => ({ ...prev, imageUrl: url }));
      else if (target === 'ann') setAnnForm(prev => ({ ...prev, imageUrl: url }));
      else if (target === 'author') updateConfig({ authorImage: url });
      else if (target === 'hero') updateConfig({ heroImageUrl: url });
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5">
          <h1 className="text-xl font-black mb-8 text-accent text-center">TESSERA_CORE</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PASSKEY" className="w-full bg-white/5 border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-accent py-4 text-[9px] font-black uppercase tracking-widest">LOG_IN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase tracking-tighter">TESSERA <span className="text-[9px] text-accent block not-italic tracking-widest font-bold">ADMIN</span></div>
        <button onClick={handleGlobalPublish} disabled={syncStatus === 'SYNCING'} className={`w-full mb-8 py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${syncStatus === 'SYNCING' ? 'bg-accent/20 animate-pulse' : syncStatus === 'SUCCESS' ? 'bg-green-600' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
          {syncStatus === 'SYNCING' ? 'PUSHING...' : syncStatus === 'SUCCESS' ? 'SYNC_OK' : 'GITHUB_PUSH'}
        </button>
        <nav className="space-y-1 flex-grow overflow-y-auto">
          {Object.values(AdminTab).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/5"><Link to="/" className="text-[9px] opacity-30 uppercase no-underline">SİTEYE DÖN</Link></div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
        {syncError && <div className="mb-8 p-4 bg-red-900/20 border border-red-900 text-red-500 text-[10px] uppercase font-mono">HATA: {syncError}</div>}

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">POSTS</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">MESSAGES</span>
              <div className="text-5xl font-black">{config.messages.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">ANNOUNCEMENTS</span>
              <div className="text-5xl font-black">{config.announcements.length}</div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { e.preventDefault(); editingId ? updatePost(editingId, postForm) : addPost(postForm); setEditingId(null); setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'}) }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="BAŞLIK" className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase focus:outline-none focus:border-accent" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-black border-b border-white/10 py-2 text-xs font-bold uppercase" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option>ARKEOLOJİ</option><option>SANAT TARİHİ</option><option>RESTORASYON</option><option>MÜZECİLİK</option><option>DİJİTALLEŞME</option>
                </select>
                <input type="text" className="bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
              </div>
              <textarea placeholder="İÇERİK" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-widest">{editingId ? 'GÜNCELLE' : 'YAYINLA'}</button>
            </form>
            <div className="space-y-4">
              {config.posts.map(p => (
                <div key={p.id} className="flex justify-between p-6 bg-white/5 border border-white/5">
                  <span className="font-bold uppercase text-xs">{p.title}</span>
                  <div className="flex gap-4">
                    <button onClick={() => {setEditingId(p.id); setPostForm(p)}} className="text-accent text-[9px] font-bold">EDIT</button>
                    <button onClick={() => deletePost(p.id)} className="text-red-900 text-[9px] font-bold">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { e.preventDefault(); editingAnnId ? updateAnnouncement(editingAnnId, annForm) : addAnnouncement(annForm); setEditingAnnId(null); setAnnForm({title:'', content:'', imageUrl:'', isActive:true}) }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <input type="text" placeholder="DUYURU BAŞLIĞI" className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase focus:outline-none focus:border-accent" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <textarea placeholder="DUYURU METNİ" rows={4} className="w-full bg-transparent border border-white/10 p-4 text-sm" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-widest">{editingAnnId ? 'GÜNCELLE' : 'YAYINLA'}</button>
            </form>
            <div className="space-y-4">
              {config.announcements.map(a => (
                <div key={a.id} className="flex justify-between p-6 bg-white/5 border border-white/5">
                  <span className="font-bold uppercase text-xs">{a.title}</span>
                  <div className="flex gap-4">
                    <button onClick={() => {setEditingAnnId(a.id); setAnnForm(a)}} className="text-accent text-[9px] font-bold">EDIT</button>
                    <button onClick={() => deleteAnnouncement(a.id)} className="text-red-900 text-[9px] font-bold">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-8 animate-entry">
            <div className="p-8 border border-accent/20 bg-accent/5">
              <h3 className="text-mono text-[10px] font-bold uppercase tracking-widest mb-6 text-accent">ROOT_CONFIG</h3>
              <div className="space-y-6">
                <div><label className="text-[9px] opacity-40 block mb-2">GITHUB_USERNAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2">REPO_NAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value})} /></div>
                <div><label className="text-[9px] text-red-500 block mb-2">PERSONAL_ACCESS_TOKEN (PAT)</label><input type="password" className="w-full bg-black border border-white/10 p-3 text-xs" value={config.githubToken} onChange={e => updateConfig({githubToken: e.target.value})} /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-entry">
             <div className="md:col-span-5 space-y-2">
                {config.messages.map(m => (
                  <button key={m.id} onClick={() => {setSelectedMessage(m); markAsRead(m.id)}} className={`w-full text-left p-6 border ${selectedMessage?.id === m.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5'}`}>
                    <div className="text-xs font-black uppercase">{m.subject}</div>
                    <div className="text-[9px] text-accent uppercase font-bold">{m.senderName}</div>
                  </button>
                ))}
             </div>
             <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 italic text-sm">
                {selectedMessage ? selectedMessage.body : "İleti Seçiniz."}
             </div>
          </div>
        )}

        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-12 animate-entry">
             <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">İSİM</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-2xl font-black uppercase italic focus:outline-none" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">BİYOGRAFİ</label>
                <textarea rows={8} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light text-white/50 italic focus:outline-none" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
             </div>
          </div>
        )}

        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-3xl space-y-12 animate-entry">
             <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">SİTE BAŞLIĞI</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-black uppercase italic focus:outline-none" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase">HERO METNİ</label>
                <textarea className="w-full bg-transparent border-b border-white/10 py-3 text-3xl font-black uppercase italic focus:outline-none" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
