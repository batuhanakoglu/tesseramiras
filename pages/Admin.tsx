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

  // FORM STATES
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
    if (!config.githubToken || config.githubToken.trim() === '') {
      alert("HATA: GitHub Token bulunamadı! Lütfen ROOT_CONFIG sekmesine gidip token yapıştırın.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setIsPublishing(true);
    try {
      await saveToGitHub();
      alert('BAŞARILI: Değişiklikler GitHub deposuna kaydedildi.');
    } catch (error: any) {
      alert(`KRİTİK HATA: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'author' | 'hero' | 'ann') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const finalUrl = await uploadImageToGitHub(file);
      if (target === 'post') setPostForm(prev => ({ ...prev, imageUrl: finalUrl }));
      else if (target === 'hero') updateConfig({ heroImageUrl: finalUrl });
      else if (target === 'author') updateConfig({ authorImage: finalUrl });
      else if (target === 'ann') setAnnForm(prev => ({ ...prev, imageUrl: finalUrl }));
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5">
          <h1 className="text-xl font-black mb-2 text-accent text-center uppercase">TESSERA_CORE</h1>
          <p className="text-[10px] text-white/30 text-center mb-8 tracking-[0.4em] uppercase">Security Protocol v2.6</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="PASSKEY" 
              className="w-full bg-white/5 border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em] font-bold uppercase" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              autoFocus 
            />
            <button type="submit" className="w-full bg-accent py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">EXEC_LOGIN</button>
          </form>
          <div className="mt-8 text-center">
            <Link to="/" className="text-[9px] text-white/20 hover:text-white uppercase tracking-widest no-underline">← ANA SAYFA</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase tracking-tighter">
          TESSERA <span className="text-[9px] text-accent block not-italic tracking-[0.3em] font-bold">CONTROL_CENTER</span>
        </div>
        
        <button 
          onClick={handleGlobalPublish} 
          disabled={isPublishing} 
          className={`w-full mb-8 py-3 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all ${isPublishing ? 'opacity-50 animate-pulse' : ''}`}
        >
          {isPublishing ? 'SYNCING...' : 'GITHUB_PUSH'}
        </button>

        <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV YÖNETİMİ' },
            { id: AdminTab.ANNOUNCEMENTS, label: 'DUYURULAR' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.AUTHOR, label: 'MÜELLİF' },
            { id: AdminTab.UI_SETTINGS, label: 'SİSTEM AYARLARI' },
            { id: AdminTab.GITHUB, label: 'ROOT_CONFIG' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              {tab.label}
              {tab.id === AdminTab.MESSAGES && config.messages.some(m => !m.read) && (
                <span className="ml-2 w-1.5 h-1.5 bg-accent rounded-full inline-block animate-pulse"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-8 mt-auto border-t border-white/5 space-y-4">
          <Link to="/" className="block text-[9px] text-white/30 hover:text-white uppercase tracking-widest no-underline">SİTE ÖNİZLEME</Link>
          <button onClick={handleLogout} className="text-red-900 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">LOG_OUT</button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-baseline mb-12 border-b border-white/5 pb-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
            <span className="text-accent opacity-30 not-italic mr-3 font-mono text-sm">CMD_</span>
            {activeTab.replace('_', ' ')}
          </h2>
          <span className="text-mono text-[9px] opacity-20 uppercase tracking-widest hidden md:block">System Status: Stable</span>
        </header>

        {/* OVERVIEW */}
        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-entry">
            <div className="bg-white/5 border border-white/5 p-8">
              <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-4">ARCHIVE_COUNT</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 border border-white/5 p-8">
              <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-4">UNREAD_MSGS</span>
              <div className="text-5xl font-black">{config.messages.filter(m => !m.read).length}</div>
            </div>
            <div className="bg-white/5 border border-white/5 p-8">
              <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-4">ACTIVE_ANN</span>
              <div className="text-5xl font-black">{config.announcements.filter(a => a.isActive).length}</div>
            </div>
            <div className="bg-accent/5 border border-accent/20 p-8">
              <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-4">SYNC_STATUS</span>
              <div className="text-xl font-black uppercase italic mt-2">{config.githubToken ? 'Connected' : 'Setup Required'}</div>
            </div>
          </div>
        )}

        {/* POSTS */}
        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={handlePostSubmit} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-mono text-[10px] text-accent font-bold uppercase tracking-widest">[{editingId ? 'EDIT_PROTOCOL' : 'ENTRY_PROTOCOL'}]</h3>
                {editingId && <button type="button" onClick={() => {setEditingId(null); setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'})}} className="text-[8px] uppercase font-bold opacity-40 hover:opacity-100">İptal</button>}
              </div>
              
              <input type="text" placeholder="BAŞLIK" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase focus:outline-none focus:border-accent" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">KATEGORİ</label>
                    <select className="w-full bg-black border-b border-white/10 py-2 text-xs font-bold focus:outline-none uppercase" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                        <option value="SANAT TARİHİ">SANAT TARİHİ</option>
                        <option value="ARKEOLOJİ">ARKEOLOJİ</option>
                        <option value="RESTORASYON">RESTORASYON</option>
                        <option value="MÜZECİLİK">MÜZECİLİK</option>
                        <option value="DİJİTALLEŞME">DİJİTALLEŞME</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">OKUMA SÜRESİ</label>
                    <input type="text" className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-bold focus:outline-none uppercase" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">KAPAK GÖRSELİ</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="Görsel URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={postForm.imageUrl} onChange={e => setPostForm({...postForm, imageUrl: e.target.value})} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent transition-all">YÜKLE</button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'post')} />
                </div>
              </div>

              <textarea placeholder="ÖZET (Max 150 Karakter)" rows={2} className="w-full bg-transparent border-b border-white/10 text-sm italic py-2 focus:outline-none" value={postForm.excerpt} onChange={e => setPostForm({...postForm, excerpt: e.target.value})} />
              
              <textarea placeholder="TAM İÇERİK" rows={12} className="w-full bg-transparent border border-white/10 p-4 text-sm focus:outline-none focus:border-accent font-light leading-relaxed custom-scrollbar" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                {editingId ? 'KAYDI GÜNCELLE' : 'ARŞİVE COMMIT ET'}
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="text-mono text-[10px] text-accent font-bold uppercase tracking-widest mb-6">EXISTING_RECORDS</h3>
              {config.posts.map(post => (
                <div key={post.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-10 bg-black border border-white/10 overflow-hidden">
                      <img src={post.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{post.title}</h4>
                      <p className="text-[8px] opacity-30 font-bold uppercase tracking-widest mt-1">{post.date} // {post.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(post.id); setPostForm({...post}); window.scrollTo({top:0, behavior:'smooth'});}} className="text-accent text-[9px] font-black uppercase tracking-widest">EDIT</button>
                    <button onClick={() => { if(confirm('Silmek istediğine emin misin?')) deletePost(post.id) }} className="text-red-900 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={handleAnnSubmit} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-mono text-[10px] text-accent font-bold uppercase tracking-widest">[{editingAnnId ? 'EDIT_ANN' : 'NEW_ANN'}]</h3>
                {editingAnnId && <button type="button" onClick={() => {setEditingAnnId(null); setAnnForm({title:'', content:'', imageUrl:'', isActive: true})}} className="text-[8px] uppercase font-bold opacity-40 hover:opacity-100">İptal</button>}
              </div>
              <input type="text" placeholder="DUYURU BAŞLIĞI" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase focus:outline-none focus:border-accent" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <div className="space-y-2">
                <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">DUYURU GÖRSELİ</label>
                <div className="flex gap-4">
                  <input type="text" placeholder="Görsel URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={annForm.imageUrl} onChange={e => setAnnForm({...annForm, imageUrl: e.target.value})} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent transition-all">YÜKLE</button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'ann')} />
                </div>
              </div>
              <textarea placeholder="DUYURU İÇERİĞİ" rows={4} className="w-full bg-transparent border border-white/10 p-4 text-sm focus:outline-none focus:border-accent font-light italic leading-relaxed" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ann-active" className="w-4 h-4 accent-accent" checked={annForm.isActive} onChange={e => setAnnForm({...annForm, isActive: e.target.checked})} />
                <label htmlFor="ann-active" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">AKTİF YAYIN</label>
              </div>
              <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                {editingAnnId ? 'GÜNCELLE' : 'DUYURU YAYINLA'}
              </button>
            </form>
            <div className="space-y-4">
              <h3 className="text-mono text-[10px] text-accent font-bold uppercase tracking-widest mb-6">EXISTING_ANNOUNCEMENTS</h3>
              {config.announcements.map(ann => (
                <div key={ann.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-black border border-white/10 overflow-hidden">
                      <img src={ann.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-tight block group-hover:text-accent transition-colors">{ann.title}</span>
                      <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest mt-1">{ann.date} // {ann.isActive ? 'AKTİF' : 'PASİF'}</span>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingAnnId(ann.id); setAnnForm({...ann}); window.scrollTo({top:0, behavior:'smooth'});}} className="text-accent text-[9px] font-black uppercase tracking-widest">EDIT</button>
                    <button onClick={() => { if(confirm('Silmek istediğine emin misin?')) deleteAnnouncement(ann.id) }} className="text-red-900 text-[9px] font-black uppercase tracking-widest hover:text-red-500">DELETE</button>
                  </div>
                </div>
              ))}
              {config.announcements.length === 0 && (
                 <div className="p-12 text-center border border-white/5 border-dashed opacity-20 uppercase text-[10px] tracking-widest">KAYIT YOK</div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-entry">
            <div className="lg:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
              {config.messages.length > 0 ? config.messages.map(msg => (
                <button 
                  key={msg.id} 
                  onClick={() => {setSelectedMessage(msg); markAsRead(msg.id);}} 
                  className={`w-full text-left p-6 border transition-all ${selectedMessage?.id === msg.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'} ${!msg.read ? 'border-l-4 border-l-accent' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black uppercase truncate pr-4">{msg.subject}</h4>
                    <span className="text-[8px] opacity-30 font-mono whitespace-nowrap">{msg.receivedAt}</span>
                  </div>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{msg.senderName}</p>
                </button>
              )) : (
                <div className="p-12 text-center border border-white/5 border-dashed opacity-20 uppercase text-[10px] tracking-widest">Inbox Empty</div>
              )}
            </div>
            <div className="lg:col-span-7 bg-white/5 border border-white/5 p-8 min-h-[400px] flex flex-col relative">
              {selectedMessage ? (
                <div className="flex-grow flex flex-col animate-entry">
                  <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">{selectedMessage.subject}</h3>
                      <div className="text-[9px] font-bold tracking-widest uppercase">
                        <span className="text-white/40 mr-2">FROM:</span>
                        <span className="text-accent">{selectedMessage.senderName}</span>
                        <span className="text-white/20 mx-3">//</span>
                        <span className="text-white/40 mr-2">EMAIL:</span>
                        <span className="text-white">{selectedMessage.senderEmail}</span>
                      </div>
                    </div>
                    <button onClick={() => { if(confirm('Mesaj silinsin mi?')) { deleteMessage(selectedMessage.id); setSelectedMessage(null); } }} className="text-red-900 text-[9px] font-black uppercase hover:text-red-500 transition-colors">DELETE</button>
                  </div>
                  <p className="text-sm italic text-white/70 whitespace-pre-wrap leading-relaxed font-light flex-grow">
                    {selectedMessage.body}
                  </p>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-white/10">
                   <span className="text-mono text-[10px] tracking-[0.5em] uppercase">BİR İLETİ SEÇİN</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUTHOR */}
        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-12 animate-entry">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">MÜELLİF İSMİ</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-2xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">UNVAN / TİTLE</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-lg font-light text-white/60 italic focus:outline-none focus:border-accent" value={config.authorTitle} onChange={e => updateConfig({authorTitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">PROFIL GÖRSELİ</label>
                <div className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden relative group">
                  <img src={config.authorImage} className="w-full h-full object-cover grayscale" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] font-bold uppercase tracking-widest">GÖRSELİ DEĞİŞTİR</button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'author')} />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">MİSYON / FELSEFE</label>
                <textarea rows={2} className="w-full bg-transparent border border-white/10 p-4 text-2xl font-black italic tracking-tighter leading-none focus:border-accent focus:outline-none" value={config.authorPhilosophy} onChange={e => updateConfig({authorPhilosophy: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">BİYOGRAFİ / HAKKINDA</label>
                <textarea rows={8} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light text-white/50 leading-relaxed italic focus:border-accent focus:outline-none" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* UI SETTINGS */}
        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-3xl space-y-12 animate-entry">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">SİTE BAŞLIĞI</label>
                    <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">VURGU RENGİ (ACCENT)</label>
                    <div className="flex gap-4 items-center">
                      <input type="color" className="bg-transparent border-none w-10 h-10 cursor-pointer" value={config.accentColor} onChange={e => updateConfig({accentColor: e.target.value})} />
                      <span className="text-mono text-xs uppercase font-bold tracking-widest">{config.accentColor}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">FONT AİLESİ</label>
                    <select className="w-full bg-black border-b border-white/10 py-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-accent" value={config.fontFamily} onChange={e => updateConfig({fontFamily: e.target.value as FontOption})}>
                      <option value="Space Grotesk">SPACE GROTESK (Modern)</option>
                      <option value="Inter">INTER (Standard)</option>
                      <option value="JetBrains Mono">JETBRAINS MONO (Tech)</option>
                      <option value="Playfair Display">PLAYFAIR DISPLAY (Classic)</option>
                    </select>
                  </div>
                </div>
             </div>
             
             <div className="pt-10 border-t border-white/5 space-y-8">
                <h3 className="text-mono text-[10px] text-accent font-bold tracking-[0.4em] uppercase italic">MANŞET_HERO_AYARLARI</h3>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">HERO BAŞLIK</label>
                      <input type="text" className="w-full bg-transparent border-b border-white/10 py-3 text-3xl md:text-5xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">HERO ALT METİN</label>
                      <textarea rows={3} className="w-full bg-transparent border border-white/10 p-4 text-lg font-light italic text-white/50 focus:outline-none focus:border-accent" value={config.heroSubtext} onChange={e => updateConfig({heroSubtext: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">HERO ARKA PLAN GÖRSELİ</label>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Görsel URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-[10px] focus:outline-none" value={config.heroImageUrl} onChange={e => updateConfig({heroImageUrl: e.target.value})} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/5 border border-white/10 px-6 py-2 text-[9px] font-bold uppercase hover:bg-accent transition-all">YÜKLE</button>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, 'hero')} />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* GITHUB / ROOT CONFIG */}
        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-10 animate-entry">
            <div className={`border p-10 space-y-8 transition-all ${config.githubToken ? 'bg-accent/5 border-accent/20' : 'bg-red-900/10 border-red-900/30'}`}>
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
            <div className="p-8 border border-white/5 text-[10px] text-white/30 font-light leading-relaxed italic">
              * Bu ayarlar Tessera'nın verilerini GitHub üzerinde kalıcı hale getirmek için gereklidir. GITHUB_PUSH butonu tüm lokal değişiklikleri (yazılar, mesajlar, ayarlar) GitHub reposundaki `data/config.json` dosyasına işler.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
