
import React, { useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { Link } from 'react-router-dom';

// Utility for parsing Turkish dates "DD MONTH YYYY"
const parseTurkishDate = (dateStr: string) => {
  const months = ["OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN", "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"];
  const parts = dateStr.trim().split(' ');
  if (parts.length !== 3) return new Date(0);
  const day = parseInt(parts[0]);
  const monthIndex = months.indexOf(parts[1].toUpperCase());
  const year = parseInt(parts[2]);
  if (monthIndex === -1) return new Date(0);
  return new Date(year, monthIndex, day);
};

export const Archive: React.FC = () => {
  const { config } = useSite();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sort posts chronologically (newest first)
  const sortedPosts = [...config.posts].sort((a, b) => {
    return parseTurkishDate(b.date).getTime() - parseTurkishDate(a.date).getTime();
  });

  return (
    <div className="bg-black min-h-screen">
      {/* Archive Header */}
      <section className="px-10 py-32 max-w-screen-2xl mx-auto border-b border-white/10 animate-entry">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <div className="text-mono text-[10px] font-bold tracking-[0.5em] opacity-30 uppercase mb-6">DATA_INDEX // CHRONOLOGICAL_ORDER</div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] uppercase italic">
              ARŞİV DİZİNİ
            </h1>
          </div>
          <div className="text-mono text-[10px] opacity-40 font-bold uppercase tracking-widest text-right">
             TOPLAM KAYIT: {config.posts.length}<br/>
             SIRALAMA: EN YENİDEN EN ESKİYE
          </div>
        </div>
      </section>

      {/* Chronological List */}
      <section className="px-10 py-20">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex flex-col border-t border-white/10">
            {sortedPosts.map((post, index) => (
              <Link 
                to={`/post/${post.id}`} 
                key={post.id} 
                className="group flex flex-col md:flex-row items-start md:items-center py-10 border-b border-white/10 hover:bg-white transition-all duration-500 px-4 no-underline"
              >
                {/* Tarih & Kategori */}
                <div className="flex items-center gap-8 md:w-1/4 mb-4 md:mb-0">
                  <span className="text-mono text-[11px] font-bold tracking-widest opacity-40 group-hover:text-black group-hover:opacity-100 transition-all">
                    {post.date}
                  </span>
                  <span className="text-mono text-[9px] font-black tracking-[0.3em] border border-white/20 px-2 py-1 group-hover:border-black/20 group-hover:text-black transition-all uppercase">
                    {post.category}
                  </span>
                </div>

                {/* Başlık */}
                <div className="flex-grow flex items-center gap-10">
                   <span className="text-mono text-[10px] opacity-10 group-hover:text-black/30 transition-all hidden lg:block">
                    [#{sortedPosts.length - index}]
                  </span>
                  <h3 className="text-3xl md:text-5xl font-black tracking-tighter leading-none group-hover:text-black group-hover:italic transition-all uppercase">
                    {post.title}
                  </h3>
                </div>

                {/* Ok & Görsel Önizleme */}
                <div className="md:w-1/6 flex justify-end items-center gap-10">
                  <div className="hidden lg:block w-20 h-12 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-4 group-hover:translate-x-0 border border-black/10">
                    <img src={post.imageUrl} className="w-full h-full object-cover grayscale" alt="preview" />
                  </div>
                  <span className="text-2xl font-light opacity-0 group-hover:opacity-100 group-hover:text-black transition-all -translate-x-4 group-hover:translate-x-0">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          
          {config.posts.length === 0 && (
            <div className="py-40 text-center border border-white/5 border-dashed">
              <p className="text-mono text-xs opacity-20 uppercase tracking-[0.5em]">ARŞİVDE HENÜZ VERİ KAYDI BULUNAMADI</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
