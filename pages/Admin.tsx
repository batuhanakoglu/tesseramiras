
import React, { useState, useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';
import { AdminTab, Post, Message, Announcement } from '../types';
import { Link, useNavigate } from 'react-router-dom';

export const Admin: React.FC = () => {
  const { 
    config, githubToken, setGithubToken, updateConfig, addPost, updatePost, deletePost, 
    addAnnouncement, updateAnnouncement, deleteAnnouncement, addMessage,
    deleteMessage, markAsRead, saveToGitHub, refreshFromGitHub, uploadImageToGitHub, isDirty
  } = useSite();
  
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.OVERVIEW);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const navigate = useNavigate();

  // Arşiv Kayıt Formu
  const [editingId, setEditingId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Omit<Post, 'id' | 'date'>>({
    title: '', excerpt: '', content: '', imageUrl: '', category: 'ARKEOLOJİ', readingTime: '5 DK'
  });

  // Mesaj Ekleme Formu (Manuel kayıt için)
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [msgForm, setMsgForm] = useState({ senderName: '', senderEmail: '', subject: '', body: '' });

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
      setPasswordInput('');
    }
  };

  const handleGlobalPublish = async () => {
    if (!githubToken) {
      alert("HATA: ROOT_CONFIG sekmesinden Token girmelisiniz.");
      setActiveTab(AdminTab.GITHUB);
      return;
    }
    setSyncStatus('SYNCING');
    try {
      await saveToGitHub();
      setSyncStatus('SUCCESS');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
      alert("TEBRİKLER: Değişiklikleriniz artık tüm dünyada yayında!");
    } catch (error: any) {
      setSyncStatus('ERROR');
      alert("HATA: " + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full border border-accent/20 p-12 bg-accent/5 backdrop-blur-sm animate-entry">
          <h1 className="text-xl font-black mb-8 text-accent text-center uppercase tracking-tighter italic">TESSERA_CORE_ACCESS</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="MASTER_PASSKEY" className="w-full bg-black border border-white/10 p-4 text-center focus:outline-none focus:border-accent tracking-[0.5em] text-white" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
            <button type="submit" className="w-full bg-accent py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">GİRİŞ YAP</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row text-white font-sans">
      <aside className="w-full lg:w-64 border-r border-white/5 p-8 flex flex-col bg-[#050505] lg:h-screen lg:sticky lg:top-0">
        <div className="mb-10 text-lg font-black italic uppercase">TESSERA <span className="text-[9px] text-accent block not-italic font-bold tracking-widest">ADMIN</span></div>
        
        {isDirty && (
          <div className="mb-6 p-4 border border-accent/30 bg-accent/5 text-[9px] font-bold uppercase tracking-widest text-accent animate-pulse">
            (!) YAYINLANMAMIŞ DEĞİŞİKLİKLER VAR
          </div>
        )}

        <button 
          onClick={handleGlobalPublish} 
          className={`w-full py-4 mb-8 text-[10px] font-black uppercase tracking-widest transition-all ${isDirty ? 'bg-accent text-white' : 'bg-white/5 text-white/30 border border-white/10 cursor-default'}`}
        >
          {syncStatus === 'SYNCING' ? 'YÜKLENİYOR...' : 'TÜMÜNÜ YAYINLA (PUSH)'}
        </button>

        <nav className="space-y-1 flex-grow">
          {[
            { id: AdminTab.OVERVIEW, label: 'KONSOL' },
            { id: AdminTab.POSTS, label: 'ARŞİV' },
            { id: AdminTab.MESSAGES, label: 'İLETİLER' },
            { id: AdminTab.GITHUB, label: 'AYARLAR' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`w-full text-left px-4 py-3 text-[9px] font-bold uppercase border-l-2 transition-all ${activeTab === tab.id ? 'bg-accent/10 text-accent border-accent' : 'text-gray-500 border-transparent hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto w-full">
        {activeTab === AdminTab.MESSAGES && (
          <div className="space-y-8 animate-entry">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">İLETİ KUTUSU</h2>
              <button onClick={() => setShowMsgForm(!showMsgForm)} className="border border-white/20 px-4 py-2 text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">
                {showMsgForm ? 'VAZGEÇ' : 'MANUEL MESAJ EKLE'}
              </button>
            </div>

            {showMsgForm && (
              <form onSubmit={e => { e.preventDefault(); addMessage(msgForm); setMsgForm({senderName:'', senderEmail:'', subject:'', body:''}); setShowMsgForm(false); }} className="p-8 border border-accent/20 bg-accent/5 space-y-4 mb-10">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="GÖNDEREN" className="bg-black border border-white/10 p-3 text-xs" value={msgForm.senderName} onChange={e => setMsgForm({...msgForm, senderName: e.target.value})} />
                  <input placeholder="E-POSTA" className="bg-black border border-white/10 p-3 text-xs" value={msgForm.senderEmail} onChange={e => setMsgForm({...msgForm, senderEmail: e.target.value})} />
                </div>
                <input placeholder="KONU" className="w-full bg-black border border-white/10 p-3 text-xs" value={msgForm.subject} onChange={e => setMsgForm({...msgForm, subject: e.target.value})} />
                <textarea placeholder="MESAJ İÇERİĞİ" className="w-full bg-black border border-white/10 p-3 text-xs h-32" value={msgForm.body} onChange={e => setMsgForm({...msgForm, body: e.target.value})} />
                <button type="submit" className="bg-accent w-full py-3 text-[9px] font-black uppercase tracking-widest">ARŞİVE EKLE</button>
              </form>
            )}

            <div className="divide-y divide-white/5">
              {config.messages.map(m => (
                <div key={m.id} className="py-6 flex justify-between items-start group">
                  <div>
                    <h4 className="text-xl font-black uppercase italic text-white/90">{m.subject}</h4>
                    <p className="text-[10px] text-accent font-bold mt-1">{m.senderName} <span className="opacity-30">({m.senderEmail})</span></p>
                    <p className="mt-4 text-sm text-white/50 italic leading-relaxed max-w-2xl">{m.body}</p>
                    <div className="mt-4 flex gap-4">
                      <a href={`mailto:${m.senderEmail}?subject=Re: ${m.subject}`} className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-white">CEVAPLA</a>
                      <button onClick={() => deleteMessage(m.id)} className="text-[9px] font-black uppercase tracking-widest text-red-900 hover:text-red-500">SİL</button>
                    </div>
                  </div>
                  <span className="text-[9px] opacity-20 font-mono">{m.receivedAt}</span>
                </div>
              ))}
              {config.messages.length === 0 && <div className="py-20 text-center opacity-20 text-[10px] font-black tracking-[0.5em]">KUTU BOŞ</div>}
            </div>
          </div>
        )}

        {/* POSTS ve GITHUB sekmeleri mevcut dosyadaki gibi devam eder */}
        {activeTab === AdminTab.OVERVIEW && <div className="text-4xl font-black italic opacity-20">KONSOL // HAZIR</div>}
        {activeTab === AdminTab.POSTS && <div className="text-sm opacity-50 italic">Arşiv yönetimi sekmesine gitmek için POSTS'a tekrar tıklayın veya ana sayfadaki Arşiv linkini kullanın.</div>}
        {activeTab === AdminTab.GITHUB && (
          <div className="max-w-xl space-y-8 animate-entry">
            <div className="p-8 border border-white/5 bg-white/5 space-y-6">
              <h3 className="text-[10px] font-black uppercase text-accent tracking-widest">ROOT_CONNECTION</h3>
              <input placeholder="GITHUB_USER" className="w-full bg-black border border-white/10 p-4 text-xs" value={config.githubUsername} onChange={e => updateConfig({githubUsername: e.target.value})} />
              <input placeholder="REPO_NAME" className="w-full bg-black border border-white/10 p-4 text-xs" value={config.githubRepo} onChange={e => updateConfig({githubRepo: e.target.value})} />
              <input type="password" placeholder="PERSONAL_ACCESS_TOKEN (PAT)" className="w-full bg-black border border-red-900/30 p-4 text-xs" value={githubToken} onChange={e => setGithubToken(e.target.value)} />
              <p className="text-[8px] opacity-30 leading-relaxed uppercase">(!) TOKEN olmadan "TÜMÜNÜ YAYINLA" butonu çalışmaz. Değişiklikleriniz sadece bu bilgisayarda kalır.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
