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
      alert('ERİŞİM REDDEDİLDİ: GEÇERSİZ PASSKEY');
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
      alert("HATA: GitHub Token eksik! ROOT_CONFIG sekmesine gidin.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setSyncStatus('SYNCING');
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
              placeholder="PASSKEY" 
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
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase">TESSERA <span className="text-[9px] text-accent block not-italic font-bold">ADMIN_V2.6</span></div>
        <div className="space-y-3 mb-8">
          <button onClick={handleGlobalPublish} disabled={syncStatus === 'SYNCING'} className={`w-full py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${syncStatus === 'SYNCING' ? 'bg-accent/20 animate-pulse' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
            {syncStatus === 'SYNCING' ? 'PUSHING...' : 'GITHUB_PUSH'}
          </button>
          <button onClick={() => refreshFromGitHub()} className="w-full py-2 border border-white/10 text-[8px] font-bold uppercase hover:bg-white/5 transition-colors">RE-FETCH CLOUD</button>
        </div>
        <nav className="space-y-1 flex-grow overflow-y-auto">
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
        <div className="pt-8 mt-8 border-t border-white/5">
          <button onClick={handleLogout} className="text-[9px] text-red-900 hover:text-red-500 font-black uppercase tracking-widest transition-colors">LOGOUT_SESSION</button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-w-6xl mx-auto w-full relative">
        {activeTab === AdminTab.OVERVIEW && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-entry">
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase">LOGS_COUNT</span>
              <div className="text-5xl font-black">{config.posts.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase">INBOX_MSGS</span>
              <div className="text-5xl font-black">{config.messages.length}</div>
            </div>
            <div className="bg-white/5 p-8 border border-white/5">
              <span className="text-[9px] text-accent font-bold block mb-4 uppercase">ACTIVE_NEWS</span>
              <div className="text-5xl font-black">{config.announcements.length}</div>
            </div>
          </div>
        )}

        {activeTab === AdminTab.MESSAGES && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-entry">
             <div className="md:col-span-5 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {config.messages.length > 0 ? config.messages.map(m => (
                  <button key={m.id} onClick={() => {setSelectedMessage(m); markAsRead(m.id)}} className={`w-full text-left p-6 border transition-all ${selectedMessage?.id === m.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                    <div className="text-xs font-black uppercase truncate">{m.subject}</div>
                    <div className="flex justify-between mt-1 text-[9px] font-bold">
                      <span className="text-accent uppercase">{m.senderName}</span>
                      <span className="opacity-20">{m.receivedAt}</span>
                    </div>
                  </button>
                )) : <div className="p-12 text-center opacity-20 uppercase text-[9px]">Kutu Boş</div>}
             </div>
             <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 flex flex-col min-h-[400px]">
                {selectedMessage ? (
                  <div className="animate-entry h-full flex flex-col">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4 mb-6">
                      <h4 className="text-xl font-black italic uppercase">{selectedMessage.subject}</h4>
                      <div className="flex gap-4">
                        <button onClick={() => handleReply(selectedMessage)} className="bg-accent px-4 py-2 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">CEVAPLA</button>
                        <button onClick={() => { if(confirm('Silinsin mi?')) { deleteMessage(selectedMessage.id); setSelectedMessage(null); } }} className="text-red-900 text-[9px] font-black uppercase">SİL</button>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono mb-6 text-accent uppercase">FROM: {selectedMessage.senderName} ({selectedMessage.senderEmail})</p>
                    <p className="text-sm italic font-light text-white/70 whitespace-pre-wrap flex-grow">{selectedMessage.body}</p>
                  </div>
                ) : <div className="m-auto opacity-10 uppercase text-[9px] tracking-widest">İleti seçiniz</div>}
             </div>
          </div>
        )}

        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-2xl space-y-8 animate-entry">
            <div className="p-8 border border-white/5 bg-white/5">
              <h3 className="text-[10px] font-black uppercase text-accent mb-6 italic">ROOT_CONFIG // GITHUB_SYNC</h3>
              <div className="space-y-6">
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase">GITHUB_USERNAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase text-white outline-none" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase">REPO_NAME</label><input className="w-full bg-black border border-white/10 p-3 text-xs uppercase text-white outline-none" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value.trim()})} /></div>
                <div><label className="text-[9px] opacity-40 block mb-2 uppercase tracking-widest">MASTER_EMAIL (İletiler İçin)</label><input className="w-full bg-black border border-white/10 p-3 text-xs text-white outline-none" value={config.githubEmail} onChange={e => updateConfig({githubEmail: e.target.value.trim()})} /></div>
                <div className="pt-4 border-t border-white/5">
                  <label className="text-[9px] text-red-500 font-black block mb-2 uppercase italic">PERSONAL_ACCESS_TOKEN (PAT)</label>
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" className="w-full bg-black border border-red-900/30 p-3 text-xs text-white outline-none" value={githubToken} onChange={e => setGithubToken(e.target.value.trim())} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
