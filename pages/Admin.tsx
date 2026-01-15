import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { 
    config, githubToken, setGithubToken, updateConfig, addPost, updatePost, deletePost, 
    addAnnouncement, updateAnnouncement, deleteAnnouncement,
    deleteMessage, markAsRead, saveToGitHub, refreshFromGitHub, uploadImageToGitHub
  } = useSite();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const annFileInputRef = useRef<HTMLInputElement>(null);

  // Arşiv Kayıt Formu
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Omit<Post, 'id' | 'date'>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'ARKEOLOJİ', readingTime: '5 DK'
  });

  // Duyuru Formu
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState<Omit<Announcement, 'id' | 'date'>>({
    title: '', content: '', imageUrl: '', isActive: true
  });

  useEffect(() => {
    if (sessionStorage.getItem('tessera_auth') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1196559621') {
      setIsAuthenticated(true);
      sessionStorage.setItem('tessera_auth', 'true');
    } else {
      alert('ERİŞİM REDDEDİLDİ: GEÇERSİZ PASSKEY');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tessera_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'POST' | 'ANN' | 'AUTHOR') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!githubToken) {
      alert("HATA: Görsel yüklemek için önce ROOT_CONFIG sekmesinden GitHub Token (PAT) girmelisiniz.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToGitHub(file);
      if (target === 'POST') setPostForm(prev => ({ ...prev, imageUrl: url }));
      else if (target === 'ANN') setAnnForm(prev => ({ ...prev, imageUrl: url }));
      else if (target === 'AUTHOR') updateConfig({ authorImage: url });
      alert("Görsel GitHub'a yüklendi. Kalıcı olması için en son PUSH yapmayı unutmayın.");
    } catch (error: any) {
      alert("Yükleme hatası: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGlobalPublish = async () => {
    if (!githubToken) {
      alert("HATA: GitHub Token eksik! ROOT_CONFIG sekmesine gidin.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setSyncStatus('SYNCING');
    try {
      await saveToGitHub();
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
      alert("Sistem başarıyla GitHub Cloud ile senkronize edildi.");
    } catch (error: any) {
      setSyncStatus('ERROR');
      setSyncError(error.message);
      alert("Push hatası: " + error.message);
    }
  };

  const handleManualPull = async () => {
    if (confirm("DİKKAT: Buluttaki veriler çekilecek. Henüz PUSH edilmemiş yerel değişiklikleriniz kaybolabilir. Devam edilsin mi?")) {
      await refreshFromGitHub();
      alert("Bulut verileri başarıyla çekildi.");
    }
  };

  const handleReply = (msg: Message) => {
    const subject = encodeURIComponent(`Re: ${msg.subject}`);
    const body = encodeURIComponent(`\n\n--- Orijinal Mesaj ---\nKimden: ${msg.senderName}\nTarih: ${msg.receivedAt}\n\n${msg.body}`);
    window.location.href = `mailto:${msg.senderEmail}?subject=${subject}&body=${body}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-accent font-sans">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5 backdrop-blur-sm animate-entry">
          <h1 className="text-xl font-black mb-8 text-accent text-center uppercase tracking-tighter italic">TESSERA_CORE_ACCESS</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="MASTER_PASSKEY" 
              className="w-full bg-black border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em] text-white" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              autoFocus 
            />
            <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">EXECUTE_LOGIN</button>
          </form>
          <div className="mt-8 text-center text-[9px] opacity-20 uppercase tracking-widest italic">Protected Archive // V2.6</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans selection:bg-accent">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase">TESSERA <span className="text-[9px] text-accent block not-italic font-bold tracking-widest">ADMIN_V2.6</span></div>
        <div className="space-y-3 mb-8">
          <button onClick={handleGlobalPublish} disabled={syncStatus === 'SYNCING'} className={`w-full py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${syncStatus === 'SYNCING' ? 'bg-accent/20 animate-pulse border-accent' : syncStatus === 'SUCCESS' ? 'bg-green-600 border-green-600 text-white' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
            {syncStatus === 'SYNCING' ? 'PUSHING_DATA...' : syncStatus === 'SUCCESS' ? 'SYNC_SUCCESS' : 'PUBLISH_TO_GITHUB'}
          </button>
          <button onClick={handleManualPull} className="w-full py-2 border border-white/10 text-[8px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">PULL_FROM_CLOUD</button>
        </div>
        <nav className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV KAYITLARI' },
            { id: AdminTab.ANNOUNCEMENTS, label: 'DUYURULAR' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.AUTHOR, label: 'MÜELLİF VERİLERİ' },
            { id: AdminTab.UI_SETTINGS, label: 'SİSTEM AYARLARI' },
            { id: AdminTab.GITHUB, label: 'ROOT_CONFIG' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 mt-8 border-t border-white/5">
          <button onClick={handleLogout} className="text-[9px] text-red-900 hover:text-red-500 font-black uppercase tracking-widest transition-colors">TERMINATE_SESSION</button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full relative">
        {syncError && <div className="mb-8 p-4 bg-red-900/20 border border-red-900 text-red-500 text-[10px] uppercase font-mono animate-entry">CRITICAL_ERROR: {syncError}</div>}

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">LOGS_COUNT</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">INBOX_MSGS</span>
              <div className="text-5xl font-black">{config.messages?.length || 0}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">ACTIVE_NEWS</span>
              <div className="text-5xl font-black">{config.announcements?.length || 0}</div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { 
              e.preventDefault(); 
              editingId ? updatePost(editingId, postForm) : addPost(postForm); 
              setEditingId(null); 
              setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'});
            }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest italic">[{editingId ? 'EDIT_ENTRY' : 'NEW_ARCHIVE_LOG'}]</h3>
              <input type="text" placeholder="BAŞLIK" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase outline-none text-white" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="bg-black border-b border-white/10 py-2 text-xs font-bold uppercase outline-none text-white" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option>ARKEOLOJİ</option><option>SANAT TARİHİ</option><option>RESTORASYON</option><option>MÜZECİLİK</option><option>DİJİTALLEŞME</option>
                </select>
                <input type="text" placeholder="OKUMA SÜRESİ" className="bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase outline-none text-white" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
              </div>
              <div className="flex gap-4 items-center">
                <input type="text" placeholder="GÖRSEL URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-xs font-bold outline-none text-white" value={postForm.imageUrl} onChange={e => setPostForm({...postForm, imageUrl: e.target.value})} />
                <input type="file" className="hidden" ref={fileInputRef} onChange={e => handleImageUpload(e, 'POST')} accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  {isUploading ? 'UPLOADING...' : 'DOSYA_SEÇ'}
                </button>
              </div>
              <textarea placeholder="ÖZET" className="w-full bg-transparent border-b border-white/10 py-2 text-sm italic text-white" value={postForm.excerpt} onChange={e => setPostForm({...postForm, excerpt: e.target.value})} />
              <textarea placeholder="İÇERİK" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light italic outline-none text-white/70" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">KAYDI_MÜHÜRLE</button>
            </form>
            <div className="space-y-4">
              {config.posts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5">
                  <div><span className="font-bold uppercase text-xs block">{p.title}</span><p className="text-[8px] opacity-30 uppercase">{p.date}</p></div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(p.id); setPostForm(p); window.scrollTo({top:0, behavior:'smooth'})}} className="text-accent text-[9px] font-black uppercase tracking-widest">EDIT</button>
                    <button onClick={() => { if(confirm('SİLİNSİN MI?')) deletePost(p.id)}} className="text-red-900 text-[9px] font-black uppercase tracking-widest">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { 
              e.preventDefault(); 
              editingAnnId ? updateAnnouncement(editingAnnId, annForm) : addAnnouncement(annForm); 
              setEditingAnnId(null); 
              setAnnForm({title:'', content:'', imageUrl:'', isActive: true});
            }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest italic">[{editingAnnId ? 'EDIT_NEWS' : 'NEW_ANNOUNCEMENT'}]</h3>
              <input type="text" placeholder="DUYURU BAŞLIĞI" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase outline-none text-white" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <div className="flex gap-4 items-center">
                <input type="text" placeholder="GÖRSEL URL" className="flex-grow bg-transparent border-b border-white/10 py-2 text-xs outline-none text-white" value={annForm.imageUrl} onChange={e => setAnnForm({...annForm, imageUrl: e.target.value})} />
                <input type="file" className="hidden" ref={annFileInputRef} onChange={e => handleImageUpload(e, 'ANN')} accept="image/*" />
                <button type="button" onClick={() => annFileInputRef.current?.click()} className="px-4 py-2 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  {isUploading ? 'UPLOADING...' : 'DOSYA_SEÇ'}
                </button>
              </div>
              <textarea placeholder="İÇERİK" className="w-full bg-transparent border-b border-white/10 py-2 text-sm italic outline-none text-white" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <div className="flex items-center gap-4">
                <input type="checkbox" id="is-active" className="accent-accent" checked={annForm.isActive} onChange={e => setAnnForm({...annForm, isActive: e.target.checked})} />
                <label htmlFor="is-active" className="text-[10px] font-bold uppercase tracking-widest text-white/50 cursor-pointer">SİSTEMDE YAYINLA</label>
              </div>
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">KAYDET</button>
            </form>
            <div className="space-y-4">
              {(config.announcements || []).map(a => (
                <div key={a.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5">
                  <div><span className={`font-bold uppercase text-xs ${!a.isActive ? 'opacity-30 line-through' : ''}`}>{a.title}</span><p className="text-[8px] opacity-30 uppercase tracking-widest mt-1">{a.date}</p></div>
                  <div className="flex gap-4">
                    <button onClick={() => {setEditingAnnId(a.id); setAnnForm(a); window.scrollTo({top:0, behavior:'smooth'})}} className="text-accent text-[9px] font-bold uppercase tracking-widest">EDIT</button>
                    <button onClick={() => { if(confirm('SİLİNSİN Mİ?')) deleteAnnouncement(a.id)}} className="text-red-900 text-[9px] font-bold uppercase tracking-widest">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-entry">
             <div className="md:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {(config.messages || []).map(m => (
                  <button key={m.id} onClick={() => {setSelectedMessage(m); markAsRead(m.id)}} className={`w-full text-left p-6 border transition-all ${selectedMessage?.id === m.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                    <div className="text-xs font-black uppercase truncate text-white">{m.subject}</div>
                    <div className="flex justify-between mt-2 text-[9px] font-bold uppercase tracking-widest">
                      <span className="text-accent">{m.senderName}</span>
                      <span className="opacity-20">{m.receivedAt}</span>
                    </div>
                  </button>
                ))}
                {(config.messages || []).length === 0 && <div className="p-12 text-center opacity-20 uppercase text-[9px] tracking-widest border border-dashed border-white/5">GELEN KUTUSU BOŞ</div>}
             </div>
             <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 flex flex-col min-h-[400px]">
                {selectedMessage ? (
                  <div className="animate-entry h-full flex flex-col">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4 mb-6">
                      <h4 className="text-xl font-black italic uppercase text-white">{selectedMessage.subject}</h4>
                      <div className="flex gap-4">
                        <button onClick={() => handleReply(selectedMessage)} className="bg-accent px-4 py-2 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">CEVAPLA</button>
                        <button onClick={() => { if(confirm('İleti silinsin mi?')) { deleteMessage(selectedMessage.id); setSelectedMessage(null); } }} className="text-red-900 text-[9px] font-black uppercase hover:text-red-500">SİL</button>
                      </div>
                    </div>
                    <div className="mb-8 space-y-1">
                      <p className="text-[10px] font-mono text-accent uppercase font-bold tracking-widest">FROM: {selectedMessage.senderName}</p>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">EMAIL: {selectedMessage.senderEmail}</p>
                    </div>
                    <p className="text-sm italic font-light text-white/70 whitespace-pre-wrap flex-grow leading-relaxed bg-black/30 p-6 border border-white/5">{selectedMessage.body}</p>
                  </div>
                ) : <div className="m-auto opacity-10 uppercase text-[9px] tracking-[0.5em] italic text-center">İLETİ SEÇİNİZ</div>}
             </div>
          </div>
        )}

        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-8 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5 space-y-8">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest italic border-b border-accent/20 pb-4">MÜELLİF_KİMLİK_VERİLERİ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">İSİM_SOYİSİM</label><input className="w-full bg-black border border-white/10 p-4 text-sm uppercase outline-none focus:border-accent text-white" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">UNVAN / POZİSYON</label><input className="w-full bg-black border border-white/10 p-4 text-sm uppercase outline-none focus:border-accent text-white" value={config.authorTitle} onChange={e => updateConfig({authorTitle: e.target.value})} /></div>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-grow">
                  <label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">PROFİL_GÖRSELİ_URL</label>
                  <input className="w-full bg-black border border-white/10 p-4 text-sm outline-none focus:border-accent text-white" value={config.authorImage} onChange={e => updateConfig({authorImage: e.target.value})} />
                </div>
                <input type="file" className="hidden" id="author-image-upload" onChange={e => handleImageUpload(e, 'AUTHOR')} accept="image/*" />
                <button type="button" onClick={() => document.getElementById('author-image-upload')?.click()} className="px-4 py-4 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  {isUploading ? '...' : 'UPLOAD'}
                </button>
              </div>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">FELSEFE / MOTTO</label><textarea className="w-full bg-black border border-white/10 p-4 text-sm italic outline-none focus:border-accent text-white" value={config.authorPhilosophy} onChange={e => updateConfig({authorPhilosophy: e.target.value})} /></div>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">DETAYLI_BİYOGRAFİ</label><textarea rows={8} className="w-full bg-black border border-white/10 p-4 text-sm italic font-light outline-none focus:border-accent text-white/70 leading-relaxed" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} /></div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-4xl space-y-8 animate-entry">
             <div className="bg-white/5 p-8 border border-white/5 space-y-8">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest italic border-b border-accent/20 pb-4">ARAYÜZ_KONFİGÜRASYONU</h3>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">SİTE_ANA_BAŞLIĞI</label><input className="w-full bg-black border border-white/10 p-4 text-sm uppercase outline-none focus:border-accent text-white" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} /></div>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">HERO_BANNER_BAŞLIĞI</label><textarea className="w-full bg-black border border-white/10 p-4 text-3xl font-black uppercase italic outline-none focus:border-accent text-white leading-none" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} /></div>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">HERO_ALT_METİN</label><textarea className="w-full bg-black border border-white/10 p-4 text-sm italic outline-none focus:border-accent text-white/50 leading-relaxed" value={config.heroSubtext} onChange={e => updateConfig({heroSubtext: e.target.value})} /></div>
              <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">HERO_ARKAPLAN_GÖRSELİ_URL</label><input className="w-full bg-black border border-white/10 p-4 text-sm outline-none focus:border-accent text-white" value={config.heroImageUrl} onChange={e => updateConfig({heroImageUrl: e.target.value})} /></div>
             </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-8 animate-entry">
            <div className="p-8 border border-white/5 bg-white/5 space-y-8">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest italic border-b border-accent/20 pb-4">ROOT_CONNECTION_PROTOCOL</h3>
              <div className="space-y-6">
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">GITHUB_USERNAME</label><input className="w-full bg-black border border-white/10 p-4 text-xs uppercase text-white outline-none focus:border-accent" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">REPO_NAME</label><input className="w-full bg-black border border-white/10 p-4 text-xs uppercase text-white outline-none focus:border-accent" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">MASTER_NOTIFICATION_EMAIL</label><input className="w-full bg-black border border-white/10 p-4 text-xs text-white outline-none focus:border-accent" placeholder="admin@tessera.com" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value.trim()})} /></div>
                <div className="pt-6 border-t border-white/5">
                  <label className="text-[9px] text-red-500 font-black block mb-2 uppercase italic tracking-widest">PERSONAL_ACCESS_TOKEN (PAT)</label>
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" className="w-full bg-black border border-red-900/30 p-4 text-xs text-white outline-none focus:border-red-500" value={githubToken} onChange={e => setGithubToken(e.target.value.trim())} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
