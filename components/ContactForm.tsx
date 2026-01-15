
import React, { useState } from 'react';
import { useSite } from '../context/SiteContext';

export const ContactForm: React.FC = () => {
  const { addMessage } = useSite();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      addMessage({
        senderName: formData.name,
        senderEmail: formData.email,
        subject: formData.subject,
        body: formData.message
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="w-full">
      {submitted ? (
        <div className="border border-accent p-12 text-center space-y-6 bg-accent/5">
          <div className="text-mono text-[10px] font-black tracking-[0.5em] text-accent uppercase">SUCCESS // SENT</div>
          <p className="text-2xl font-black uppercase tracking-tighter italic">İleti Arşivlendi.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">AD_SOYAD</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase tracking-widest"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="group space-y-2">
              <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">E_POSTA</label>
              <input 
                type="email" 
                required
                className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold tracking-widest"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">KONU</label>
            <input 
              type="text" 
              required
              className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-accent transition-all text-xs font-bold uppercase tracking-widest"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div className="group space-y-2">
            <label className="text-mono text-[9px] text-accent font-bold uppercase tracking-widest">İÇERİK</label>
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
              {isSubmitting ? 'TRANSMITTING...' : 'SEND_PROTOCOL →'}
            </div>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </form>
      )}
    </div>
  );
};
