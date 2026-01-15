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
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    category: 'ARKEOLOJİ',
    readingTime: '5 DK'
  });

  // ANNOUNCEMENT FORM STATE
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
    navigate('/');
  };

  const handleOpenMessage = (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      markAsRead(msg.id);
    }
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
      console.error(error);
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full border border-accent/20 p-12 space-y-10 bg-accent/5">
          <div className="text-center">
            <h1 className="text-xl font-black mb-2 text-accent uppercase">TESSERA_CORE</h1>
            <p className="text-mono text-[9px] opacity-30 uppercase tracking-[0.3em]">Güvenlik Protokolü v4.0</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="PASSKEY" 
              className="w-full bg-white/5 border border-white/10 p-4 text-center text-xs font-bold tracking-widest focus:outline-none focus:border-accent transition-all uppercase" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              autoFocus 
            />
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
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col p-8 lg:h-screen lg:sticky lg:top-0 bg-[#050505] z-[110]">
        <div className="mb-10 flex justify-between items-center lg:block">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight italic">TESSERA</h1>
            <span className="text-[9px] text-accent font-bold uppercase tracking-widest block">v2.6 STANDALONE</span>
          </div>
        </div>
        
        <button 
          onClick={handleGlobalPublish}
          disabled={isPublishing}
          className={`w-full mb-8 py-3 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all ${isPublishing ? 'opacity-30 animate-pulse cursor-wait' : ''}`}
        >
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
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex-shrink-0 lg:w-full text-left px-5 py-3 text-[9px] font-bold uppercase border-l-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
              {tab.id === AdminTab.MESSAGES && config.messages.some(m => !m.read) && (
                <span className="ml-2 w-1.5 h-1.5 bg-accent rounded-full inline-block animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden lg:flex pt-6 border-t border-white/5 justify-between items-center text-[8px] font-bold">
          <button onClick={() => navigate('/')} className="text-accent opacity-60 hover:opacity-100 uppercase tracking-widest">SİTE_ÖNİZLEME</button>
          <button onClick={handleLogout} className="text-red-900 hover:text-red-500 uppercase tracking-widest">LOG_OUT</button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl">
        <h2 className="text-2xl font-black tracking-tighter uppercase mb-12 pb-6 border-b border-white/5 italic flex items-center">
          <span className="text-accent opacity-50 mr-4 font-mono text-xs not-italic">CMD_</span>{activeTab.replace('_', ' ')}
        </h2>

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3 tracking-widest">ARCHIVE_COUNT</span>
              <span className="text-4xl font-black tabular-nums">{config.posts.length}</span>
            </div>
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3 tracking-widest">NEW_MESSAGES</span>
              <span className="text-4xl font-black tabular-nums">{config.messages.filter(m => !m.read).length}</span>
            </div>
            <div className="border border-white/5 p-8 bg-white/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3 tracking-widest">ACTIVE_ANN</span>
              <span className="text-4xl font-black tabular-nums">{config.announcements.filter(a => a.isActive).length}</span>
            </div>
            <div className="border border-accent/20 p-8 bg-accent/5">
              <span className="text-[8px] text-accent font-bold uppercase block mb-3 tracking-widest">SYSTEM_STATUS</span>
              <span className="text-lg font-black block mt-2 text-accent italic uppercase animate-pulse">
                {config.githubToken ? 'Sync_Ready' : 'Setup_Required'}
              </span>
            </div>
          </div>
        )}

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-16">
            <form onSubmit={handlePostSubmit} className="space-y-8 bg-white/5 p-8 border border-white/5">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-mono text-[10px] text-accent font-bold tracking-[0.4em] uppercase">[{editingId ? 'EDIT_PROTOCOL' : 'ENTRY_PROTOCOL'}]</h3>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'})}} className="text-[8px] font-bold text-white/30 hover:text-white uppercase">Vazgeç</button>}
              </div>
              <input type="text" placeholder="ENTRY_TITLE" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase italic focus:outline-none focus:border-accent" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] text-accent font-bold uppercase tracking-widest">KATEGORİ</label>
                  <select className="w-full bg-black border-b border-white/10 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                    <option value="SANAT TARİHİ">SANAT TARİHİ</option>
                    <option value="ARKEOLOJİ">ARKEOLOJİ</option>
                    <option value="RESTORASYON">RESTORASYON</option>
                    <option value="MÜZECİLİK">MÜZECİLİK</option>
                    <option value="DİJİTALLEŞME">DİJİTALLEŞME</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-accent font-bold uppercase tracking-widest">OKUMA SÜRESİ</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-accent font-bold uppercase tracking-widest">MEDYA_YÜKLEME</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="IMAGE_URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={postForm.imageUrl} onChange={e => setPostForm({...postForm, imageUrl: e.target.value})} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent hover:text-white transition-all">GÖRSEL_SEÇ</button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'post')} />
                </div>
              </div>

              <textarea placeholder="EXCERPT // ÖZET" rows={2} className="w-full bg-transparent border-b border-white/10 text-sm font-light italic text-white/50 py-2 focus:outline-none focus:border-accent leading-relaxed" value={postForm.excerpt} onChange={e => setPostForm({...postForm, excerpt: e.target.value})} />
              <textarea placeholder="FULL_CONTENT // TAM İÇERİK" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light text-white/70 focus:outline-none focus:border-accent leading-relaxed custom-scrollbar" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />

              <button type="submit" className="w-full bg-accent text-white py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                {editingId ? 'UPDATE_ARCHIVE_LOG' : 'COMMIT_TO_ARCHIVE'}
              </button>
            </form>

            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-mono text-[10px] text-accent font-bold tracking-[0.4em] uppercase mb-4">EXISTING_LOGS</h3>
              {config.posts.map(post => (
                <div key={post.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-10 bg-black overflow-hidden border border-white/10 hidden md:block">
                      <img src={post.imageUrl} className="w-full h-full object-cover grayscale opacity-50" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{post.title}</h4>
                      <p className="text-[8px] text-white/30 font-bold tracking-widest uppercase mt-1">{post.date} // {post.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(post.id); setPostForm({...post}); window.scrollTo({top: 0, behavior: 'smooth'});}} className="text-[9px] font-bold text-white/40 hover:text-accent uppercase tracking-widest transition-colors">EDIT</button>
                    <button onClick={() => deletePost(post.id)} className="text-[9px] font-bold text-red-900 hover:text-red-500 uppercase tracking-widest transition-colors">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
              {config.messages.length > 0 ? config.messages.map(msg => (
                <button 
                  key={msg.id} 
                  onClick={() => handleOpenMessage(msg)}
                  className={`w-full text-left p-6 border transition-all ${selectedMessage?.id === msg.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'} ${!msg.read ? 'border-l-4 border-l-accent' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-accent">{msg.senderName}</span>
                    <span className="text-[8px] opacity-30 font-mono">{msg.receivedAt}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase truncate">{msg.subject}</h4>
                </button>
              )) : (
                <div className="h-40 flex items-center justify-center opacity-10 border border-white/5 border-dashed">
                  <span className="text-mono text-[10px] tracking-widest">NO_MESSAGES</span>
                </div>
              )}
            </div>
            <div className="lg:col-span-7 bg-white/5 border border-white/5 p-8 min-h-[400px] flex flex-col">
              {selectedMessage ? (
                <div className="flex-grow flex flex-col">
                  <div className="border-b border-white/10 pb-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black uppercase italic tracking-tight">{selectedMessage.subject}</h3>
                      <button onClick={() => {deleteMessage(selectedMessage.id); setSelectedMessage(null);}} className="text-[9px] font-bold text-red-900 hover:text-red-600 uppercase tracking-widest">İLETİYİ_SİL</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[9px] font-bold tracking-widest uppercase">
                      <div className="text-white/40">GÖNDEREN: <span className="text-white">{selectedMessage.senderName}</span></div>
                      <div className="text-white/40">E-POSTA: <span className="text-white">{selectedMessage.senderEmail}</span></div>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed font-light whitespace-pre-wrap italic">
                    {selectedMessage.body}
                  </p>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-white/10">
                  <span className="text-mono text-[10px] tracking-[0.5em] uppercase">SELECT_A_MESSAGE</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">MÜELLİF_İSMİ</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-2xl font-black uppercase italic focus:border-accent focus:outline-none" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">UNVAN_/_TİTLE</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-lg font-light text-white/60 italic focus:border-accent focus:outline-none" value={config.authorTitle} onChange={e => updateConfig({authorTitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] text-accent font-bold uppercase tracking-widest">KİMLİK_GÖRSELİ</label>
                <div className="aspect-[4/5] border border-white/10 overflow-hidden relative group">
                  <img src={config.authorImage} className="w-full h-full object-cover grayscale" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-bold uppercase tracking-widest">DEĞİŞTİR</button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'author')} />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-accent font-bold uppercase tracking-widest">FELSEFE_PROTOKOLÜ</label>
                <textarea rows={3} className="w-full bg-transparent border border-white/10 p-4 text-2xl font-black italic tracking-tighter leading-none focus:border-accent focus:outline-none" value={config.authorPhilosophy} onChange={e => updateConfig({authorPhilosophy: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-accent font-bold uppercase tracking-widest">BİYOGRAFİ_DATALARI</label>
                <textarea rows={6} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light text-white/50 leading-relaxed italic focus:border-accent focus:outline-none" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-3xl space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">SİTE_BAŞLIĞI</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-black uppercase italic focus:border-accent focus:outline-none" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">VURGU_RENGİ</label>
                  <input type="color" className="w-full h-12 bg-transparent border-none cursor-pointer" value={config.accentColor} onChange={e => updateConfig({accentColor: e.target.value})} />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">FONT_AİLESİ</label>
                  <select className="w-full bg-black border-b border-white/10 py-3 text-xs font-bold uppercase tracking-widest focus:border-accent focus:outline-none" value={config.fontFamily} onChange={(e) => updateConfig({fontFamily: e.target.value as FontOption})}>
                    <option value="Space Grotesk">SPACE GROTESK</option>
                    <option value="Inter">INTER</option>
                    <option value="JetBrains Mono">JETBRAINS MONO</option>
                    <option value="Playfair Display">PLAYFAIR DISPLAY</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-8 pt-10 border-t border-white/5">
              <h3 className="text-mono text-[10px] text-accent font-bold tracking-[0.5em] uppercase italic">HERO_SECTION_CONFIG</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">ANA_MANŞET</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-3xl md:text-5xl font-black uppercase italic focus:border-accent focus:outline-none" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">ALT_METİN</label>
                  <textarea rows={3} className="w-full bg-transparent border border-white/10 p-4 text-lg font-light italic text-white/40 focus:border-accent focus:outline-none" value={config.heroSubtext} onChange={e => updateConfig({heroSubtext: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-accent font-bold uppercase tracking-widest">HERO_MANŞET_GÖRSELİ</label>
                  <div className="flex gap-4">
                    <input type="text" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={config.heroImageUrl} onChange={e => updateConfig({heroImageUrl: e.target.value})} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent hover:text-white transition-all">DEĞİŞTİR</button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'hero')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-10">
            <div className={`border p-8 space-y-8 transition-all ${config.githubToken ? 'bg-accent/5 border-accent/20' : 'bg-red-900/10 border-red-900/30'}`}>
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                 <div className={`w-3 h-3 rounded-full ${config.githubToken ? 'bg-accent animate-pulse' : 'bg-red-600'}`}></div>
                 <h3 className="text-mono text-[10px] font-bold tracking-[0.4em] uppercase">
                   {config.githubToken ? 'SYSTEM_ROOT_ACCESS: OK' : 'SYSTEM_ROOT_ACCESS: REQUIRED'}
                 </h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">GITHUB_USERNAME</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold tracking-widest focus:border-accent focus:outline-none uppercase" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value.trim()})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">GITHUB_REPO_NAME</label>
                  <input type="text" className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold tracking-widest focus:border-accent focus:outline-none uppercase" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value.trim()})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40 text-red-500">PERSONAL_ACCESS_TOKEN (PAT)</label>
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold tracking-widest focus:border-accent focus:outline-none" value={config.githubToken} onChange={e => updateConfig({githubToken: e.target.value.trim()})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest opacity-40">COMMITTER_EMAIL</label>
                  <input type="email" className="w-full bg-black/40 border border-white/10 p-3 text-xs font-bold tracking-widest focus:border-accent focus:outline-none" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value.trim()})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-16">
             <form onSubmit={handleAnnSubmit} className="space-y-8 bg-white/5 p-8 border border-white/5">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-mono text-[10px] text-accent font-bold tracking-[0.4em] uppercase">[{editingAnnId ? 'EDIT_ANN' : 'NEW_ANN'}]</h3>
                {editingAnnId && <button type="button" onClick={() => {setEditingAnnId(null); setAnnForm({title:'', content:'', imageUrl:'', isActive: true})}} className="text-[8px] font-bold text-white/30 hover:text-white uppercase">Vazgeç</button>}
              </div>
              <input type="text" placeholder="ANNOUNCEMENT_TITLE" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase italic focus:outline-none focus:border-accent" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <div className="space-y-2">
                <label className="text-[9px] text-accent font-bold uppercase tracking-widest">MEDIA_YÜKLEME</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="IMAGE_URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={annForm.imageUrl} onChange={e => setAnnForm({...annForm, imageUrl: e.target.value})} />
                  <button type="button" onClick={() => annFileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent hover:text-white transition-all">YÜKLE</button>
                  <input type="file" ref={annFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'announcement')} />
                </div>
              </div>
              <textarea placeholder="İÇERİK // CONTENT" rows={3} className="w-full bg-transparent border-b border-white/10 text-sm font-light italic text-white/50 py-2 focus:outline-none focus:border-accent leading-relaxed" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ann-active" className="w-4 h-4 accent-accent" checked={annForm.isActive} onChange={e => setAnnForm({...annForm, isActive: e.target.checked})} />
                <label htmlFor="ann-active" className="text-[9px] font-bold uppercase tracking-widest cursor-pointer">AKTİF YAYIN</label>
              </div>
              <button type="submit" className="w-full bg-accent text-white py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                {editingAnnId ? 'UPDATE_ANNOUNCEMENT' : 'COMMIT_ANNOUNCEMENT'}
              </button>
            </form>
            <div className="grid grid-cols-1 gap-4">
              {config.announcements.map(ann => (
                <div key={ann.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight">{ann.title}</h4>
                    <p className="text-[8px] text-accent font-bold tracking-widest uppercase mt-1">{ann.date} // {ann.isActive ? 'ACTIVE' : 'INACTIVE'}</p>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingAnnId(ann.id); setAnnForm({...ann});}} className="text-[9px] font-bold text-white/40 hover:text-accent uppercase transition-colors">EDIT</button>
                    <button onClick={() => deleteAnnouncement(ann.id)} className="text-[9px] font-bold text-red-900 hover:text-red-500 uppercase transition-colors">DELETE</button>
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