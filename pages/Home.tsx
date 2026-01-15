
import React, { useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';
import { Link } from 'react-router-dom';
import { ContactForm } from '../components/ContactForm';

export const Home: React.FC = () => {
  const { config } = useSite();
  const latestPost = config.posts.length > 0 ? config.posts[0] : null;
  const activeAnnouncements = config.announcements?.filter(a => a.isActive) || [];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2.5; // Hassasiyet artırıldı
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center px-6 md:px-10 py-24 max-w-screen-2xl mx-auto border-b border-white/5 animate-entry overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={config.heroImageUrl} alt="Hero" className="w-full h-full object-cover grayscale opacity-20 contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
        </div>
        <div className="relative z-10 w-full">
          <div className="text-mono text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-10">ARCHIVE_SYSTEM // READY</div>
          <h1 className="text-4xl md:text-[8vw] font-black tracking-tighter leading-[0.9] mb-16 italic text-white uppercase">{config.heroText}</h1>
          <div className="max-w-2xl">
            <p className="text-lg md:text-2xl text-white/40 leading-tight font-light border-l border-accent pl-10 mb-12 italic">{config.heroSubtext}</p>
            <Link to="/archive" className="group relative inline-block text-[10px] font-black tracking-[0.5em] border border-accent/30 px-10 py-5 hover:border-accent transition-all uppercase no-underline">
              <span className="relative z-10 text-white">DİZİNE GİRİŞ ↓</span>
              <div className="absolute inset-0 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Slider */}
      {activeAnnouncements.length > 0 && (
        <section className="border-b border-white/5 bg-[#050505] py-24">
          <div className="px-6 md:px-10 max-w-screen-2xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <div className="text-mono text-[10px] font-bold tracking-[0.5em] text-accent uppercase italic mb-2">NEWS_STREAM // DISPATCH</div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">GÜNCEL_DUYURULAR.</h2>
              </div>
              <div className="hidden md:block text-mono text-[9px] opacity-20 uppercase tracking-widest">TUT_KAYDIR →</div>
            </div>

            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex gap-10 overflow-x-auto cursor-grab active:cursor-grabbing pb-12 scrollbar-hide select-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {activeAnnouncements.map((ann) => (
                <div key={ann.id} className="flex-shrink-0 w-[85vw] md:w-[45vw] group relative border border-white/5 bg-white/5 overflow-hidden hover:border-accent/40 transition-all duration-700 snap-center">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                      <img src={ann.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[4s]" alt={ann.title} draggable="false" />
                    </div>
                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-between bg-black/40">
                      <div>
                        <span className="text-mono text-[8px] text-accent font-bold tracking-widest uppercase mb-4 block">[{ann.date}]</span>
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 leading-tight group-hover:text-accent transition-colors">{ann.title}</h3>
                        <p className="text-sm text-white/40 italic font-light leading-relaxed line-clamp-4">{ann.content}</p>
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
        <section className="px-6 md:px-10 py-32 max-w-screen-2xl mx-auto border-b border-white/5">
          <div className="text-mono text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-16 italic">FEATURED_LOG // 01</div>
          <Link to={`/post/${latestPost.id}`} className="group block no-underline">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              <div className="lg:col-span-7 aspect-[16/9] overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-white/10 relative">
                <img src={latestPost.imageUrl} alt={latestPost.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all"></div>
              </div>
              <div className="lg:col-span-5 space-y-8">
                <div className="flex items-center gap-4 text-mono text-[10px] font-bold uppercase">
                  <span className="text-accent tracking-widest">{latestPost.category}</span>
                  <span className="opacity-20">//</span>
                  <span className="opacity-30 tracking-widest">{latestPost.date}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase group-hover:text-accent transition-all text-white leading-[0.9]">{latestPost.title}</h2>
                <p className="text-xl text-white/30 font-light leading-relaxed italic">{latestPost.excerpt}</p>
                <div className="pt-6">
                  <span className="text-mono text-[10px] font-black tracking-[0.4em] border-b border-accent/20 pb-2 group-hover:border-accent group-hover:text-accent transition-all uppercase text-white">DATA_READ →</span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Contact Section */}
      <section className="px-6 md:px-10 py-32 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5">
            <div className="text-mono text-[10px] font-bold tracking-[0.5em] text-accent uppercase mb-8">CONNECTION // PROTOCOL</div>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-8 text-white">VERİ GİRİŞİ.</h2>
            <p className="text-xl text-white/30 font-light leading-tight italic">Arşiv kayıtları ve dijital restorasyon üzerine diyalog başlatmak için güvenli kanalı kullanın.</p>
          </div>
          <div className="lg:col-span-7"><ContactForm /></div>
        </div>
      </section>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
