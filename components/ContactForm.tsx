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
    
    // 1. Yerel Veritabanına Kaydet (Opsiyonel: Gönderen kişinin kendi tarayıcısında kalır)
    addMessage({
      senderName: formData.name,
      senderEmail: formData.email,
      subject: formData.subject,
      body: formData.message
    });

    // 2. Mailto Protokolü (Gerçek iletişim: Sahibine ulaşması için en güvenli statik yol)
    // Mesajın size ulaşması için config içindeki githubEmail kullanılır.
    const recipient = config.githubEmail || 'batuhanakoglu@gmail.com'; // Yedek adres
    const mailSubject = encodeURIComponent(`Tessera Arşiv İletisi: ${formData.subject}`);
    const mailBody = encodeURIComponent(
      `GÖNDEREN: ${formData.name}\n` +
      `E-POSTA: ${formData.email}\n` +
      `------------------------------------------\n\n` +
      `${formData.message}`
    );
    
    // Küçük bir gecikme ile mail uygulamasını tetikle
    setTimeout(() => {
      window.location.href = `mailto:${recipient}?subject=${mailSubject}&body=${mailBody}`;
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Başarı mesajını 5 saniye sonra kapat
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <div className="w-full">
      {submitted ? (
        <div className="border border-accent p-12 text-center space-y-6 bg-accent/5 animate-entry">
          <div className="text-mono text-[10px] font-black tracking-[0.5em] text-accent uppercase">SUCCESS // TRANSMITTED</div>
          <p className="text-2xl font-black uppercase tracking-tighter italic">İleti Hazırlandı.</p>
          <p className="text-[10px] opacity-40 uppercase max-w-xs mx-auto leading-relaxed">
            Lütfen açılan e-posta istemciniz üzerinden "Gönder" butonuna basarak iletimi tamamlayınız.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-[9px] font-bold text-accent uppercase tracking-widest border-b border-accent/20 hover:border-accent"
          >
            YENİ FORM OLUŞTUR
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 animate-entry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">GÖNDERİCİ_AD</label>
              <input 
                type="text" 
                required 
                className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">İLETİŞİM_ADRESİ</label>
              <input 
                type="email" 
                required 
                className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">KONU_BAŞLIĞI</label>
            <input 
              type="text" 
              required 
              className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase" 
              value={formData.subject} 
              onChange={e => setFormData({...formData, subject: e.target.value})} 
            />
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">İLETİ_İÇERİĞİ</label>
            <textarea 
              required 
              rows={4} 
              className="w-full bg-transparent border border-white/10 p-4 focus:outline-none focus:border-accent transition-all text-xs leading-relaxed italic" 
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="group relative w-full border border-accent text-accent font-black py-5 overflow-hidden transition-all hover:text-white"
          >
            <div className="relative z-10 flex items-center justify-center gap-4 text-[10px] tracking-[0.4em] uppercase">
              {isSubmitting ? 'PREPARING_PACKET...' : 'EXECUTE_SEND_PROTOCOL →'}
            </div>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </form>
      )}
    </div>
  );
};
