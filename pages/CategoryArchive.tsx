
import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

// URL slug'larını veri tabanındaki tam kategori isimlerine eşleyen matris
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'sanat-tarihi': 'SANAT TARİHİ',
  'arkeoloji': 'ARKEOLOJİ',
  'restorasyon': 'RESTORASYON',
  'muzecilik': 'MÜZECİLİK',
  'dijitallesme': 'DİJİTALLEŞME'
};

export const CategoryArchive: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const { config } = useSite();
  
  // URL'den gelen slug'ı gerçek kategori ismine dönüştür
  const categoryName = useMemo(() => {
    return name ? CATEGORY_SLUG_MAP[name] : null;
  }, [name]);

  // Yazıları filtrele ve kronolojik sırala
  const filteredPosts = useMemo(() => {
    if (!categoryName) return [];
    return config.posts
      .filter(p => p.category.toUpperCase() === categoryName.toUpperCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [config.posts, categoryName]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [name]);

  if (!categoryName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-black">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter text-white">GEÇERSİZ DİZİN</h1>
        <Link to="/" className="text-mono text-[10px] border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all font-bold tracking-[0.3em] text-white">ANA SAYFAYA DÖN</Link>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Category Header */}
      <section className="px-10 py-32 max-w-screen-2xl mx-auto border-b border-white/10 animate-entry">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="max-w-4xl">
            <div className="text-mono text-[10px] font-bold tracking-[0.5em] opacity-30 uppercase mb-6 text-white">BİLİM DALI // KATEGORİ İNDEKSİ</div>
            <h1 className="text-6xl md:text-[9vw] font-black tracking-tighter leading-[0.8] uppercase italic text-white">
              {categoryName}
            </h1>
          </div>
          <div className="text-mono text-[10px] opacity-40 font-bold uppercase tracking-widest text-right text-white">
             ARŞİV DURUMU: AKTİF<br/>
             {filteredPosts.length} DATA_LOG BULUNDU
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <section className="px-10 py-24 max-w-screen-2xl mx-auto">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post) => (
              <Link 
                to={`/post/${post.id}`} 
                key={post.id}
                className="group relative bg-white/5 border border-white/10 overflow-hidden hover:border-white transition-all duration-500 flex flex-col"
              >
                {/* Image Section */}
                <div className="aspect-[16/10] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 relative">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-white/10 px-3 py-1 text-mono text-[8px] text-white font-bold tracking-widest uppercase">
                    READ: {post.readingTime}
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-10 space-y-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="text-mono text-[9px] font-bold tracking-widest opacity-40 text-white mb-4">
                      {post.date}
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase leading-none group-hover:italic transition-all text-white mb-6">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 font-light leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-8 flex items-center gap-4">
                    <div className="h-px flex-grow bg-white/10 group-hover:bg-white/30 transition-colors" />
                    <span className="text-mono text-[9px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      DATA_OPEN →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center border border-white/5 border-dashed flex flex-col items-center">
            <div className="w-20 h-20 border border-white/10 flex items-center justify-center text-mono text-xs opacity-20 mb-10 rotate-45">NULL</div>
            <p className="text-mono text-xs opacity-20 uppercase tracking-[0.5em] text-white">BU DİZİNDE HENÜZ VERİ KAYDI BULUNAMADI</p>
            <Link 
              to="/" 
              className="inline-block mt-12 text-[10px] font-black tracking-widest uppercase border border-white/20 px-10 py-4 hover:bg-white hover:text-black transition-all text-white"
            >
              ANA SAYFAYA DÖN
            </Link>
          </div>
        )}
      </section>

      {/* Cross-Navigation Section */}
      <section className="bg-white/5 border-t border-white/10 py-20 px-10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-mono text-[10px] opacity-20 uppercase tracking-[0.4em] text-white italic">
            DIGITAL_ARCHIVE_PROTOCOL_STABLE // CATEGORY_VIEW: {categoryName}
          </p>
          <Link to="/archive" className="text-xs font-black tracking-[0.3em] uppercase border-b border-white/30 hover:border-white transition-all text-white">
            TÜM ARŞİVİ KEŞFET
          </Link>
        </div>
      </section>
    </div>
  );
};
