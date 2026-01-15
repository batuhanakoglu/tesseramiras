import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';

export const ContactForm: React.FC = () => {
  const { config, addMessage } = useSite();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    addMessage({
      senderName: formData.name,
      senderEmail: formData.email,
      subject: formData.subject,
      body: formData.message
    });

    const recipient = config.githubEmail || 'batuhanakoglu@gmail.com'; 
    const mailSubject = encodeURIComponent(`Tessera İletisi: ${formData.subject}`);
    const mailBody = encodeURIComponent(
      `GÖNDEREN: ${formData.name}\n` +
      `E-POSTA: ${formData.email}\n` +
      `------------------------------------------\n\n` +
      `${formData.message}`
    );
    
    setTimeout(() => {
      window.location.href = `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="w-full">
      {submitted ? (
        <div className="border border-accent p-12 text-center space-y-6 bg-accent/5 animate-entry">
          <div className="text-mono text-[10px] font-black tracking-[0.5em] text-accent uppercase">SUCCESS // SENT</div>
          <p className="text-2xl font-black uppercase tracking-tighter italic text-white">İleti Hazırlandı.</p>
          <p className="text-[10px] opacity-40 uppercase max-w-xs mx-auto leading-relaxed text-white">
            Lütfen e-posta istemcinizden "Gönder" butonuna basarak iletimi tamamlayın.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-entry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">GÖNDERİCİ_AD</label>
              <input type="text" required className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">İLETİŞİM_ADRESİ</label>
              <input type="email" required className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">KONU_BAŞLIĞI</label>
            <input type="text" required className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase text-white" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">İÇERİK_VERİSİ</label>
            <textarea required rows={4} className="w-full bg-transparent border border-white/10 p-4 focus:outline-none focus:border-accent transition-all text-xs leading-relaxed italic text-white" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
          </div>
          <button type="submit" disabled={isSubmitting} className="group relative w-full border border-accent text-accent font-black py-5 overflow-hidden transition-all hover:text-white">
            <div className="relative z-10 flex items-center justify-center gap-4 text-[10px] tracking-[0.4em] uppercase">
              {isSubmitting ? 'PREPARING...' : 'SEND_PROTOCOL →'}
            </div>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </form>
      )}
    </div>
  );
};
