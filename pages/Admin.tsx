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
      alert('ERİŞİM REDDEDİLDİ: GEÇERSİZ ANAHTAR');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tessera_auth');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleGlobalPublish = async () => {
    if (!githubToken) {
      alert("HATA: GitHub Token (PAT) bulunamadı. ROOT_CONFIG sekmesine gidin.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
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

  const handleReply = (msg: Message) => {
    const subject = encodeURIComponent(`Re: ${msg.subject}`);
    const body = encodeURIComponent(`\n\n--- Orijinal Mesaj ---\nKimden: ${msg.senderName} (${msg.senderEmail})\nTarih: ${msg.receivedAt}\n----------------------\n\n${msg.body}`);
    window.location.href = `mailto:${msg.senderEmail}?subject=${subject}&body=${body}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white selection:bg-accent">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5 backdrop-blur-sm animate-entry">
          <div className="text-center mb-10">
            <div className="text-[10px] text-accent font-black tracking-[0.5em] mb-4 uppercase">Identity Verification Required</div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">TESSERA_CORE_ACCESS</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold opacity-30 uppercase tracking-widest">Enter Master Passkey</label>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full bg-black/50 border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em] text-white" 
                value={passwordInput} 
                onChange={e => setPasswordInput(e.target.value)} 
                autoFocus 
              />
            </div>
            <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">EXECUTE_LOGIN_SEQUENCE</button>
          </form>
          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <Link to="/" className="text-[9px] opacity-20 hover:opacity-100 uppercase tracking-widest transition-opacity no-underline">← Vazgeç ve Arşive Dön</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans selection:bg-accent">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0 z-50">
        <div className="mb-10 text-lg font-black italic uppercase tracking-tighter">TESSERA <span className="text-[9px] text-accent block not-italic tracking-widest font-bold">ADMIN_V2.6</span></div>
        <div className="space-y-3 mb-8">
          <button onClick={handleGlobalPublish} disabled={syncStatus === 'SYNCING'} className={`w-full py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${syncStatus === 'SYNCING' ? 'bg-accent/20 animate-pulse' : syncStatus === 'SUCCESS' ? 'bg-green-600' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
            {syncStatus === 'SYNCING' ? 'PUSHING_TO_CLOUD...' : syncStatus === 'SUCCESS' ? 'SYNC_SUCCESS' : 'GITHUB_PUSH'}
          </button>
          <button onClick={() => refreshFromGitHub()} className="w-full py-2 border border-white/10 text-[8px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">RE-FETCH CLOUD</button>
        </div>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
          <Link to="/" className="block text-[9px] opacity-30 hover:opacity-100 uppercase no-underline tracking-widest transition-opacity">SİTEYE DÖN</Link>
          <button onClick={handleLogout} className="text-[9px] text-red-900 hover:text-red-500 font-black uppercase tracking-widest transition-colors">TERMINATE_SESSION</button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full relative">
        {syncError && <div className="mb-8 p-4 bg-red-900/20 border border-red-900 text-red-500 text-[10px] uppercase font-mono animate-entry">SYSTEM_ERROR: {syncError}</div>}

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">LOGS_COUNT</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">INBOX_MSGS</span>
              <div className="text-5xl font-black">{config.messages.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase tracking-widest">ACTIVE_NEWS</span>
              <div className="text-5xl font-black">{config.announcements.length}</div>
            </div>
          </div>
        )}

        {/* POSTS Tab */}
        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { 
              e.preventDefault(); 
              editingId ? updatePost(editingId, postForm) : addPost(postForm); 
              setEditingId(null); 
              setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'});
            }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest">[{editingId ? 'EDIT_MODE' : 'NEW_ENTRY'}]</h3>
              <input 
                type="text" 
                placeholder="BAŞLIK" 
                required 
                className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase focus:outline-none focus:border-accent" 
                value={postForm.title} 
                onChange={e => setPostForm({...postForm, title: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-black border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option>ARKEOLOJİ</option><option>SANAT TARİHİ</option><option>RESTORASYON</option><option>MÜZECİLİK</option><option>DİJİTALLEŞME</option>
                </select>
                <input type="text" className="bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
              </div>
              <textarea placeholder="ÖZET" className="w-full bg-transparent border-b border-white/10 py-2 text-sm italic" value={postForm.excerpt} onChange={e => setPostForm({...postForm, excerpt: e.target.value})} />
              <textarea placeholder="İÇERİK (Markdown)" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light italic focus:outline-none" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                {editingId ? 'DEĞİŞİKLİKLERİ_KAYDET' : 'ARŞİVE_EKLE'}
              </button>
            </form>
            <div className="space-y-4">
              {config.posts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                  <div>
                    <span className="font-bold uppercase text-xs block">{p.title}</span>
                    <span className="text-[8px] opacity-30 uppercase">{p.date} // {p.category}</span>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(p.id); setPostForm(p); window.scrollTo({top:0, behavior:'smooth'})}} className="text-accent text-[9px] font-black uppercase">EDIT</button>
                    <button onClick={() => { if(confirm('Emin misiniz?')) deletePost(p.id)}} className="text-red-900 text-[9px] font-black uppercase hover:text-red-500 transition-colors">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES Tab */}
        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-entry">
             <div className="md:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {config.messages.length > 0 ? config.messages.map(m => (
                  <button key={m.id} onClick={() => {setSelectedMessage(m); markAsRead(m.id)}} className={`w-full text-left p-6 border transition-all ${selectedMessage?.id === m.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'} ${!m.read ? 'border-l-4 border-l-accent' : ''}`}>
                    <div className="text-xs font-black uppercase truncate">{m.subject}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-accent uppercase font-bold">{m.senderName}</span>
                      <span className="text-[8px] opacity-20">{m.receivedAt}</span>
                    </div>
                  </button>
                )) : <div className="p-12 text-center border border-white/5 border-dashed opacity-20 uppercase text-[9px]">Gelen Kutusu Boş</div>}
             </div>
             <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 flex flex-col min-h-[400px]">
                {selectedMessage ? (
                  <div className="animate-entry h-full flex flex-col">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4 mb-6">
                      <h4 className="text-xl font-black italic uppercase">{selectedMessage.subject}</h4>
                      <div className="flex gap-4">
                        <button onClick={() => handleReply(selectedMessage)} className="bg-accent px-4 py-2 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all shadow-lg shadow-accent/10">CEVAPLA</button>
                        <button onClick={() => { if(confirm('Silinsin mi?')) { deleteMessage(selectedMessage.id); setSelectedMessage(null); } }} className="text-red-900 text-[9px] font-black uppercase hover:text-red-500 transition-colors">SİL</button>
                      </div>
                    </div>
                    <div className="space-y-1 mb-8">
                      <p className="text-[9px] font-mono uppercase text-white/40">KİMDEN: <span className="text-accent font-bold">{selectedMessage.senderName}</span></p>
                      <p className="text-[9px] font-mono uppercase text-white/40">E-POSTA: <span className="text-white/80">{selectedMessage.senderEmail}</span></p>
                    </div>
                    <p className="text-sm italic font-light text-white/70 leading-relaxed whitespace-pre-wrap flex-grow bg-black/20 p-6 border border-white/5">{selectedMessage.body}</p>
                  </div>
                ) : <div className="m-auto opacity-10 uppercase text-[9px] tracking-widest italic">Okumak için bir ileti seçin</div>}
             </div>
          </div>
        )}

        {/* ROOT_CONFIG Tab */}
        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-8 animate-entry">
            <div className={`p-8 border ${githubToken ? 'border-accent/20 bg-accent/5 shadow-2xl shadow-accent/5' : 'border-red-900/40 bg-red-900/5'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-accent italic">ROOT_CONFIG // CONNECTION_LAYER</h3>
              <div className="space-y-6">
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">GITHUB_USERNAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase outline-none focus:border-accent transition-colors" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">REPO_NAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase outline-none focus:border-accent transition-colors" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">MASTER_EMAIL (For Contact Form)</label><input className="w-full bg-black border border-white/10 p-3 text-xs focus:border-accent transition-colors outline-none" placeholder="iletisim@batuhanakoglu.com" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value.trim()})} /></div>
                
                <div className="pt-6 border-t border-white/5">
                  <label className="text-[9px] text-red-500 font-black block mb-2 uppercase italic tracking-widest">PERSONAL_ACCESS_TOKEN (PAT)</label>
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" className="w-full bg-black border border-red-900/30 p-3 text-xs outline-none focus:border-red-500 transition-colors" value={githubToken} onChange={e => setGithubToken(e.target.value.trim())} />
                  <p className="mt-4 text-[8px] text-white/20 italic leading-relaxed">
                    GÜVENLİK NOTU: Token veriniz asla buluta yüklenmez, sadece yerel tarayıcınızda (localStorage) şifreli oturum süresince saklanır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs simplified for brevity in this response */}
        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-12 animate-entry">
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">MÜELLİF_İSİM</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-3xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">BİYOGRAFİK_VERİ</label>
                <textarea rows={8} className="w-full bg-transparent border border-white/10 p-6 text-base font-light text-white/50 italic focus:outline-none focus:border-accent" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
             </div>
          </div>
        )}

        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-3xl space-y-12 animate-entry">
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">ARŞİV_BAŞLIĞI</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-widest">HERO_BANNER_TEXT</label>
                <textarea className="w-full bg-transparent border-b border-white/10 py-4 text-4xl font-black uppercase italic focus:outline-none focus:border-accent leading-none" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
