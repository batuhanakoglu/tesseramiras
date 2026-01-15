
import React from 'react';
import { useSite } from '../context/SiteContext';
import { Link } from 'react-router-dom';
import { ContactForm } from '../components/ContactForm';

export const Home: React.FC = () => {
  const { config } = useSite();
  const latestPost = config.posts.length > 0 ? config.posts[0] : null;
  const activeAnnouncements = config.announcements?.filter(a => a.isActive) || [];

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center px-6 md:px-10 py-24 md:py-40 max-w-screen-2xl mx-auto border-b border-white/5 animate-entry overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImageUrl} 
            alt="Hero" 
            className="w-full h-full object-cover grayscale opacity-20 contrast-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full">
          <div className="text-mono text-[9px] md:text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-8 md:mb-10">ARCHIVE_SYSTEM // READY</div>
          <h1 className="text-4xl md:text-[8vw] font-black tracking-tighter leading-[0.9] md:leading-[0.8] mb-12 md:mb-16 italic text-white uppercase">
            {config.heroText}
          </h1>
          <div className="max-w-2xl">
            <p className="text-lg md:text-2xl text-white/40 leading-tight font-light border-l border-accent pl-6 md:pl-10 mb-10 md:mb-12 italic">
              {config.heroSubtext}
            </p>
            <Link to="/archive" className="group relative inline-block text-[9px] md:text-[10px] font-black tracking-[0.5em] border border-accent/30 px-8 md:px-10 py-4 md:py-5 hover:border-accent transition-all uppercase">
              <span className="relative z-10 group-hover:text-white transition-colors text-white">DİZİNE GİRİŞ ↓</span>
              <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      {activeAnnouncements.length > 0 && (
        <section className="border-b border-white/5 overflow-hidden">
          {/* Ticker */}
          <div className="bg-accent/10 border-b border-white/5 py-3 md:py-4 overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-[marquee_30s_linear_infinite] text-mono text-[8px] md:text-[9px] font-black tracking-[0.3em] uppercase text-accent">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="mx-6 md:mx-10">
                  {activeAnnouncements[0].title} // {activeAnnouncements[0].date} // PROTOCOL_UPDATE
                </span>
              ))}
            </div>
          </div>

          {/* Announcement Cards */}
          <div className="px-6 md:px-10 py-16 md:py-24 max-w-screen-2xl mx-auto">
             <div className="flex items-baseline gap-10 mb-10 md:mb-16">
                <div className="text-mono text-[9px] md:text-[10px] font-bold tracking-[0.5em] text-accent uppercase italic">NEWS_FEED // UPDATES</div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {activeAnnouncements.map((ann) => (
                  <div key={ann.id} className="group relative border border-white/5 bg-white/5 overflow-hidden hover:border-accent/40 transition-all duration-700 animate-entry">
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-square overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                        <img src={ann.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt={ann.title} />
                      </div>
                      <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col justify-between">
                        <div>
                          <span className="text-mono text-[8px] text-accent font-bold tracking-widest uppercase mb-3 md:mb-4 block">[{ann.date}]</span>
                          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3 md:mb-4 group-hover:text-accent transition-colors">{ann.title}</h3>
                          <p className="text-sm text-white/40 italic font-light leading-relaxed">{ann.content}</p>
                        </div>
                        <div className="mt-6 md:mt-8">
                           <div className="h-px w-0 group-hover:w-full bg-accent transition-all duration-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {latestPost && (
        <section className="px-6 md:px-10 py-16 md:py-32 max-w-screen-2xl mx-auto border-b border-white/5">
          <div className="text-mono text-[9px] md:text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-10 md:mb-16 italic">FEATURED_LOG // 01</div>
          <Link to={`/post/${latestPost.id}`} className="group block relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-center">
              <div className="lg:col-span-7 aspect-[16/9] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 border border-white/10 relative">
                <img src={latestPost.imageUrl} alt={latestPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="absolute inset-0 border-[10px] md:border-[20px] border-black/50 group-hover:border-accent/10 transition-colors"></div>
              </div>
              <div className="lg:col-span-5 space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 text-mono text-[9px] md:text-[10px] font-bold">
                  <span className="text-accent tracking-widest uppercase">{latestPost.category}</span>
                  <span className="opacity-20 text-white">//</span>
                  <span className="opacity-30 tracking-widest text-white">{latestPost.date}</span>
                </div>
                <h2 className="text-3xl md:text-6xl font-black tracking-tighter leading-[1] md:leading-[0.9] uppercase group-hover:text-accent transition-all text-white">
                  {latestPost.title}
                </h2>
                <p className="text-lg md:text-xl text-white/30 font-light leading-relaxed italic">
                  {latestPost.excerpt}
                </p>
                <div className="pt-4 md:pt-6">
                  <span className="text-mono text-[9px] md:text-[10px] font-black tracking-[0.4em] border-b border-accent/20 pb-2 group-hover:border-accent group-hover:text-accent transition-all uppercase text-white">
                    DATA_READ →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Contact Section */}
      <section className="px-6 md:px-10 py-16 md:py-32 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          <div className="lg:col-span-5">
            <div className="text-mono text-[9px] md:text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-6 md:mb-8">CONNECTION // PROTOCOL</div>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase italic mb-6 md:mb-8 text-white">
              VERİ GİRİŞİ.
            </h2>
            <div className="h-1 w-16 md:w-20 bg-accent mb-6 md:mb-8"></div>
            <p className="text-lg md:text-xl text-white/30 font-light leading-tight italic">
              Arşiv kayıtları ve dijital restorasyon üzerine diyalog başlatmak için güvenli kanalı kullanın.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
