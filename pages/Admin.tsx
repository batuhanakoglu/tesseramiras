import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement, FontOption } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { 
    config, githubToken, setGithubToken, updateConfig, addPost, updatePost, deletePost, 
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
    if (!githubToken) {
      alert("HATA: GitHub Token eksik! ROOT_CONFIG sekmesine gidin.");
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
          <h1 className="text-xl font-black mb-8 text-accent text-center uppercase tracking-tighter">TESSERA_CORE_ACCESS</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PASSKEY" className="w-full bg-white/5 border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit" className="w-full bg-accent py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">EXECUTE_LOGIN</button>
          </form>
          <div className="mt-8 text-center"><Link to="/" className="text-[8px] opacity-20 uppercase tracking-widest">Giriş Vazgeç</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase tracking-tighter">TESSERA <span className="text-[9px] text-accent block not-italic tracking-widest font-bold">ADMIN_V2</span></div>
        <button onClick={handleGlobalPublish} disabled={syncStatus === 'SYNCING'} className={`w-full mb-8 py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${syncStatus === 'SYNCING' ? 'bg-accent/20 animate-pulse' : syncStatus === 'SUCCESS' ? 'bg-green-600' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
          {syncStatus === 'SYNCING' ? 'SYNCING...' : syncStatus === 'SUCCESS' ? 'PUSH_SUCCESS' : 'GITHUB_PUSH'}
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/5"><Link to="/" className="text-[9px] opacity-30 uppercase no-underline">SİTEYE DÖN</Link></div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
        {syncError && <div className="mb-8 p-4 bg-red-900/20 border border-red-900 text-red-500 text-[10px] uppercase font-mono">KRİTİK HATA: {syncError}</div>}

        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">LOGS_COUNT</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">INBOX_MSGS</span>
              <div className="text-5xl font-black">{config.messages.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4">ACTIVE_NEWS</span>
              <div className="text-5xl font-black">{config.announcements.length}</div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.POSTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { e.preventDefault(); editingId ? updatePost(editingId, postForm) : addPost(postForm); setEditingId(null); setPostForm({title:'', excerpt:'', content:'', imageUrl:'', category:'ARKEOLOJİ', readingTime:'5 DK'}) }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest">[{editingId ? 'EDIT_MODE' : 'NEW_ENTRY'}]</h3>
              <input type="text" placeholder="BAŞLIK" required className="w-full bg-transparent border-b border-white/10 py-4 text-2xl font-black uppercase focus:outline-none focus:border-accent" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-black border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none" value={postForm.category} onChange={e => setPostForm({...postForm, category: e.target.value})}>
                  <option>ARKEOLOJİ</option><option>SANAT TARİHİ</option><option>RESTORASYON</option><option>MÜZECİLİK</option><option>DİJİTALLEŞME</option>
                </select>
                <input type="text" className="bg-transparent border-b border-white/10 py-2 text-xs font-bold uppercase focus:outline-none" value={postForm.readingTime} onChange={e => setPostForm({...postForm, readingTime: e.target.value})} />
              </div>
              <textarea placeholder="İÇERİK (Markdown destekli)" rows={10} className="w-full bg-transparent border border-white/10 p-4 text-sm font-light italic focus:outline-none" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} />
              <button type="submit" className="w-full bg-accent py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                {editingId ? 'GÜNCELLE' : 'ARŞİVE EKLE'}
              </button>
            </form>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase opacity-30 tracking-widest">LOG_LISTING</h3>
              {config.posts.map(p => (
                <div key={p.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                  <div className="flex flex-col">
                    <span className="font-bold uppercase text-xs">{p.title}</span>
                    <span className="text-[8px] opacity-30 uppercase">{p.date} // {p.category}</span>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingId(p.id); setPostForm(p); window.scrollTo({top:0, behavior:'smooth'})}} className="text-accent text-[9px] font-black uppercase tracking-widest">EDIT</button>
                    <button onClick={() => { if(confirm('Emin misiniz?')) deletePost(p.id)}} className="text-red-900 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DUYURULAR - TAM ENTEGRE EDİLDİ */}
        {activeTab === AdminTab.ANNOUNCEMENTS && (
          <div className="space-y-12 animate-entry">
            <form onSubmit={e => { e.preventDefault(); editingAnnId ? updateAnnouncement(editingAnnId, annForm) : addAnnouncement(annForm); setEditingAnnId(null); setAnnForm({title:'', content:'', imageUrl:'', isActive:true}) }} className="space-y-6 bg-white/5 p-8 border border-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest">[{editingAnnId ? 'EDIT_ANN' : 'NEW_ANN'}]</h3>
              <input type="text" placeholder="DUYURU BAŞLIĞI" required className="w-full bg-transparent border-b border-white/10 py-4 text-xl font-black uppercase focus:outline-none focus:border-accent" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
              <textarea placeholder="DUYURU METNİ" rows={4} className="w-full bg-transparent border border-white/10 p-4 text-sm italic font-light focus:outline-none" value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ann-active" checked={annForm.isActive} onChange={e => setAnnForm({...annForm, isActive: e.target.checked})} className="accent-accent" />
                <label htmlFor="ann-active" className="text-[10px] uppercase font-bold tracking-widest">YAYINDA MI?</label>
              </div>
              <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                {editingAnnId ? 'DUYURUYU GÜNCELLE' : 'YENİ DUYURU YAYINLA'}
              </button>
            </form>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase opacity-30 tracking-widest">ANN_LOGS</h3>
              {config.announcements.map(a => (
                <div key={a.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 hover:border-accent/20 transition-all">
                   <div className="flex flex-col">
                    <span className={`font-bold uppercase text-xs ${!a.isActive ? 'line-through opacity-30' : ''}`}>{a.title}</span>
                    <span className="text-[8px] opacity-30 uppercase">{a.date}</span>
                  </div>
                  <div className="flex gap-6">
                    <button onClick={() => {setEditingAnnId(a.id); setAnnForm(a); window.scrollTo({top:0, behavior:'smooth'})}} className="text-accent text-[9px] font-black uppercase">EDIT</button>
                    <button onClick={() => { if(confirm('Emin misiniz?')) deleteAnnouncement(a.id) }} className="text-red-900 text-[9px] font-black uppercase">DELETE</button>
                  </div>
                </div>
              ))}
              {config.announcements.length === 0 && <div className="p-12 text-center border border-white/5 border-dashed text-[10px] opacity-20 uppercase tracking-widest">Hiç duyuru yok.</div>}
            </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-8 animate-entry">
            <div className={`p-8 border transition-all ${githubToken ? 'border-accent/20 bg-accent/5' : 'border-red-900/40 bg-red-900/5'}`}>
              <h3 className="text-mono text-[10px] font-black uppercase tracking-widest mb-6 text-accent">ROOT_CONFIG // GITHUB_LINK</h3>
              <div className="space-y-6">
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase">GITHUB_USERNAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase focus:border-accent outline-none" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase">REPO_NAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase focus:border-accent outline-none" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value.trim()})} /></div>
                
                <div className="pt-4 border-t border-white/5">
                  <label className="text-[9px] text-red-500 font-black block mb-2 uppercase italic">!!! PERSONAL_ACCESS_TOKEN (PAT)</label>
                  <input 
                    type="password" 
                    placeholder="ghp_xxxxxxxxxxxx" 
                    className="w-full bg-black border border-red-900/30 p-3 text-xs focus:border-red-500 outline-none" 
                    value={githubToken} 
                    onChange={e => setGithubToken(e.target.value.trim())} 
                  />
                  <p className="mt-2 text-[8px] text-white/30 italic">Not: Güvenlik gereği bu token asla repo'ya (config.json) kaydedilmez, sadece tarayıcınızda saklanır.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
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
                )) : (
                  <div className="p-12 text-center border border-white/5 border-dashed opacity-20 uppercase text-[9px] tracking-widest italic">Kutu Boş</div>
                )}
             </div>
             <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 flex flex-col min-h-[400px]">
                {selectedMessage ? (
                  <div className="animate-entry">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4 mb-6">
                      <h4 className="text-xl font-black italic uppercase">{selectedMessage.subject}</h4>
                      <button onClick={() => { if(confirm('Silinsin mi?')) { deleteMessage(selectedMessage.id); setSelectedMessage(null); } }} className="text-red-900 text-[9px] font-black uppercase hover:text-red-500">DELETE</button>
                    </div>
                    <p className="text-xs font-mono mb-6 text-accent">FROM: {selectedMessage.senderName} ({selectedMessage.senderEmail})</p>
                    <p className="text-sm italic font-light text-white/70 leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>
                ) : (
                  <div className="m-auto opacity-10 uppercase text-[9px] tracking-widest">İleti Seçin</div>
                )}
             </div>
          </div>
        )}

        {/* AUTHOR & UI SETTINGS - STANDART AKTARIM */}
        {activeTab === AdminTab.AUTHOR && (
          <div className="max-w-4xl space-y-12 animate-entry">
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">IDENT_NAME</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-3xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.authorName} onChange={e => updateConfig({authorName: e.target.value})} />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">MÜELLİF_BİYOGRAFİ</label>
                <textarea rows={8} className="w-full bg-transparent border border-white/10 p-6 text-base font-light text-white/50 italic focus:outline-none focus:border-accent" value={config.authorBio} onChange={e => updateConfig({authorBio: e.target.value})} />
             </div>
          </div>
        )}

        {activeTab === AdminTab.UI_SETTINGS && (
          <div className="max-w-3xl space-y-12 animate-entry">
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">SİTE_ANA_BAŞLIK</label>
                <input className="w-full bg-transparent border-b border-white/10 py-3 text-xl font-black uppercase italic focus:outline-none focus:border-accent" value={config.siteTitle} onChange={e => updateConfig({siteTitle: e.target.value})} />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">HERO_TEXT_MASTER</label>
                <textarea className="w-full bg-transparent border-b border-white/10 py-4 text-4xl font-black uppercase italic focus:outline-none focus:border-accent leading-none" value={config.heroText} onChange={e => updateConfig({heroText: e.target.value})} />
             </div>
          </div>
        )}
      </main>
    </div>
  );
};
