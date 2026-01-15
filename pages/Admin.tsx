
import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement } from '../types';
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
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const navigate = useNavigate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Omit<Post, 'id' | 'date'>>({
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'ARKEOLOJİ',
    readingTime: '5 DK'
  });

  const [annForm, setAnnForm] = useState<Omit<Announcement, 'id' | 'date'>>({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true
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
  };

  const handleGlobalPublish = async () => {
    setIsPublishing(true);
    try {
      await saveToGitHub();
      alert('GITHUB SENKRONİZASYONU TAMAMLANDI.');
    } catch (error: any) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAiEnhance = async () => {
    if (!postForm.content || !postForm.title) return;
    setIsAiProcessing(true);
    try {
      const enhanced = await generateArchaeologicalInsight(postForm.title, postForm.content);
      if (enhanced) setPostForm(prev => ({ ...prev, content: enhanced }));
    } finally {
      setIsAiProcessing(false);
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

  const handleOpenMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) markAsRead(msg.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full border border-accent/20 p-8 md:p-12 space-y-8 md:space-y-10 bg-accent/5">
          <div className="text-center">
            <h1 className="text-xl font-black mb-2 text-accent uppercase">TESSERA_CORE</h1>
            <p className="text-mono text-[9px] opacity-30 uppercase tracking-[0.3em]">Güvenlik Protokolü v4.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PASSKEY" className="w-full bg-white/5 border border-white/10 p-4 text-center text-xs font-bold tracking-widest focus:outline-none focus:border-accent transition-all uppercase" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-accent text-white py-4 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">EXEC_AUTH</button>
          </form>
          <div className="pt-4 text-center">
            <Link to="/" className="text-mono text-[8px] opacity-30 hover:opacity-100 hover:text-accent transition-all uppercase tracking-widest font-bold">
              ← ANA SAYFA
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col p-5 lg:p-8 lg:h-screen lg:sticky lg:top-0 bg-[#050505] z-[110]">
        <div className="mb-6 lg:mb-10 flex justify-between items-center lg:block">
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-tight italic">TESSERA</h1>
            <span className="text-[8px] md:text-[9px] text-accent font-bold uppercase tracking-widest block">v2.6 STANDALONE</span>
          </div>
          <button onClick={handleLogout} className="lg:hidden text-red-900 text-[8px] font-black uppercase tracking-widest px-2 py-1 border border-red-900/20">LOG_OUT</button>
        </div>
        
        <button 
          onClick={handleGlobalPublish}
          disabled={isPublishing}
          className={`w-full mb-6 lg:mb-8 py-3 border border-accent/30 text-accent text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all ${isPublishing ? 'opacity-30' : ''}`}
        >
          {isPublishing ? 'SYNC...' : 'PUSH_CHANGES'}
        </button>

        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible space-x-1 lg:space-x-0 lg:space-y-1 flex-grow scrollbar-hide lg:custom-scrollbar pb-2 lg:pb-0">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV' },
            { id: AdminTab.ANNOUNCEMENTS, label: 'DUYURULAR' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.AUTHOR, label: 'MÜELLİF' },
            { id: AdminTab.UI_SETTINGS, label: 'SİSTEM' },
            { id: AdminTab.GITHUB, label: 'ROOT' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex-shrink-0 lg:w-full text-left px-3 md:px-5 py-2 md:py-3 text-[8px] md:text-[9px] font-bold uppercase border-l-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
              {tab.id === AdminTab.MESSAGES && config.messages.some(m => !m.read) && (
                <span className="ml-2 w-1 h-1 bg-accent rounded-full inline-block animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden lg:flex pt-6 border-t border-white/5 justify-between items-center text-[8px] font-bold">
          <button onClick={() => navigate('/')} className="text-accent opacity-60 hover:opacity-100 uppercase tracking-widest">SİTEYİ GÖR</button>
          <button onClick={handleLogout} className="text-red-900 hover:text-red-500 uppercase tracking-widest">LOG_OUT</button>
        </div>
      </aside>

      <main className="flex-grow p-5 md:p-12 overflow-y-auto">
        <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase mb-8 md:mb-12 pb-4 md:pb-6 border-b border-white/5 italic">
          <span className="text-accent opacity-50 mr-2 md:mr-4 font-mono text-[10px] md:text-xs not-italic">CMD_</span>{activeTab.replace('_', ' ')}
        </h2>

        {/* Console / Overview */}
        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="border border-white/5 p-4 md:p-6 bg-white/5">
              <span className="text-[7px] md:text-[8px] text-accent font-bold uppercase block mb-2 md:mb-3 tracking-widest">DATA_LOGS</span>
              <span className="text-2xl md:text-3xl font-black tabular-nums">{config.posts.length}</span>
            </div>
            <div className="border border-white/5 p-4 md:p-6 bg-white/5">
              <span className="text-[7px] md:text-[8px] text-accent font-bold uppercase block mb-2 md:mb-3 tracking-widest">ACTIVE_ANNS</span>
              <span className="text-2xl md:text-3xl font-black tabular-nums">{config.announcements?.filter(a => a.isActive).length || 0}</span>
            </div>
            <div className="border border-white/5 p-4 md:p-6 bg-white/5">
              <span className="text-[7px] md:text-[8px] text-accent font-bold uppercase block mb-2 md:mb-3 tracking-widest">BUILD_STAMP</span>
              <span className="text-base md:text-lg font-black block mt-1 uppercase">V2.6_BRUTAL</span>
            </div>
            <div className="border border-accent/20 p-4 md:p-6 bg-accent/5">
              <span className="text-[7px] md:text-[8px] text-accent font-bold uppercase block mb-2 md:mb-3 tracking-widest">STATUS</span>
              <span className="text-base md:text-lg font-black block mt-1 text-accent italic uppercase animate-pulse">Sync_Ready</span>
            </div>
          </div>
        )}

        {/* Announcements Management */}
        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-10 md:space-y-16">
            <form onSubmit={handleAnnSubmit} className="max-w-3xl space-y-6 md:space-y-8">
              <input type="text" placeholder="ANNOUNCEMENT_TITLE" required className="w-full bg-transparent border-b border-white/10 py-3 text-base md:text-xl font-black uppercase italic focus:outline-none focus:border-accent" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              
              <div className="space-y-3">
                <label className="text-[9px] text-accent font-bold uppercase tracking-widest">MEDIA_URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" className="flex-grow bg-transparent border-b border-white/10 text-[10px] py-2 focus:outline-none focus:border-accent" value={annForm.imageUrl} onChange={e => setAnnForm({...annForm, imageUrl: e.target.value})} />
                  <button type="button" onClick={() => annFileInputRef.current?.click()} className="bg-accent/10 border border-accent/20 px-4 py-2 text-[8px] font-bold text-accent uppercase hover:bg-accent hover:text-white transition-all">UPLOAD</button>
                  <input type="file" ref={annFileInputRef} className="hidden" onChange={e => handleImageUpload(e, 'announcement')} />
                </div>
              </div>

              <textarea placeholder="ANNOUNCEMENT_CONTENT" required rows={4} className="w-full bg-transparent border-b border-white/10 text-xs md:text-base font-light italic text-white/40 py-2 focus:outline-none focus:border-accent leading-relaxed" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="isActive" className="w-4 h-4 accent-accent" checked={annForm.isActive} onChange={e => setAnnForm({...annForm, isActive: e.target.checked})} />
                <label htmlFor="isActive" className="text-[9px] font-bold uppercase tracking-widest cursor-pointer">AKTİF YAYIN PROTOKOLÜ</label>
              </div>

              <button type="submit" className="w-full md:w-auto bg-accent text-white px-10 py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                {editingAnnId ? 'UPDATE_ANNOUNCEMENT' : 'COMMIT_ANNOUNCEMENT'}
              </button>
            </form>

            <div className="border-t border-white/10 pt-10">
              <h3 className="text-[9px] text-accent font-bold uppercase mb-6 tracking-widest">EXISTING_ANNOUNCEMENTS</h3>
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {config.announcements?.map(ann => (
                  <div key={ann.id} className="flex flex-col sm:flex-row justify-between p-4 md:p-5 border border-white/5 hover:border-accent/40 transition-all bg-white/5 gap-4">
                    <div className="flex-grow">
                      <h4 className={`text-sm md:text-base font-black uppercase tracking-tight ${!ann.isActive ? 'opacity-30' : ''}`}>{ann.title}</h4>
                      <p className="text-[7px] md:text-[8px] text-accent font-bold tracking-widest uppercase mt-1">{ann.date} // {ann.isActive ? 'STATUS: ACTIVE' : 'STATUS: INACTIVE'}</p>
                    </div>
                    <div className="flex gap-4 items-center sm:justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <button onClick={() => {setEditingAnnId(ann.id); setAnnForm({...ann});}} className="text-[8px] font-bold uppercase text-white/40 hover:text-accent transition-colors">EDIT_LOG</button>
                      <button onClick={() => deleteAnnouncement(ann.id)} className="text-[8px] font-bold text-red-900 uppercase hover:text-red-500 transition-colors">ERASE</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
