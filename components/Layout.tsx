
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import { FONTS_MAP } from '../constants';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTopicsOpen, setIsTopicsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: 'SANAT TARİHİ', slug: 'sanat-tarihi' },
    { name: 'ARKEOLOJİ', slug: 'arkeoloji' },
    { name: 'RESTORASYON', slug: 'restorasyon' },
    { name: 'MÜZECİLİK', slug: 'muzecilik' },
    { name: 'DİJİTALLEŞME', slug: 'dijitallesme' },
  ];

  const [activeHoverCategory, setActiveHoverCategory] = useState<string>(categories[0].name);

  const postsByCategory = useMemo(() => {
    const groups: Record<string, typeof config.posts> = {};
    config.posts.forEach(post => {
      const cat = post.category.toUpperCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(post);
    });
    return groups;
  }, [config.posts]);

  // Sayfa değişiminde menüyü kapat
  useEffect(() => {
    setIsTopicsOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsTopicsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const currentFontFamily = FONTS_MAP[config.fontFamily] || 'sans-serif';
    // Update the CSS variable used by Tailwind sans font
    document.documentElement.style.setProperty('--font-sans', currentFontFamily);
  }, [config.fontFamily]);

  const handleLogoClick = (e: React.MouseEvent) => {
    setLogoClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 7) {
        e.preventDefault();
        navigate('/admin');
        return 0;
      }
      return newCount;
    });
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setLogoClicks(0), 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white transition-all duration-300 overflow-x-hidden font-sans">
      {!isAdminPage && (
        <nav 
          ref={navRef}
          className="fixed top-0 left-0 w-full z-[999] bg-black/95 backdrop-blur-2xl border-b border-white/5 flex h-14 md:h-20 items-stretch"
        >
          {/* LOGO */}
          <Link 
            to="/"
            onClick={handleLogoClick}
            className="flex items-center px-4 md:px-10 border-r border-white/5 group relative cursor-pointer no-underline text-white overflow-hidden shrink-0"
          >
            <div className="text-xs md:text-xl font-black tracking-tighter z-10 uppercase transition-colors group-hover:text-black whitespace-nowrap">
              {config.siteTitle}
            </div>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </Link>

          {/* MAIN NAV AREA */}
          <div className="flex flex-grow items-stretch">
            {/* KONULAR BUTTON */}
            <div className="relative flex items-stretch border-r border-white/5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTopicsOpen(!isTopicsOpen);
                }}
                className={`h-full flex items-center px-3 md:px-10 text-[8px] md:text-[10px] text-mono font-bold tracking-[0.2em] md:tracking-[0.4em] transition-all uppercase whitespace-nowrap ${isTopicsOpen ? 'text-accent bg-accent/10' : 'text-white/60 hover:text-accent'}`}
              >
                KONULAR <span className={`ml-1 md:ml-2 transition-transform duration-300 ${isTopicsOpen ? 'rotate-180 text-accent' : 'opacity-30'}`}>↓</span>
              </button>
              
              {/* DROPDOWN MENU */}
              <div 
                className={`absolute top-full left-0 w-screen md:w-[800px] bg-black border-b md:border border-white/10 transition-all duration-500 z-[1000] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] ${
                  isTopicsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
                }`}
              >
                {/* CATEGORY LIST */}
                <div className="w-full md:w-[260px] flex flex-col bg-black max-h-[50vh] md:max-h-none overflow-y-auto custom-scrollbar">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/category/${cat.slug}`}
                      onMouseEnter={() => setActiveHoverCategory(cat.name)}
                      onClick={() => setIsTopicsOpen(false)}
                      className={`px-6 py-4 md:py-5 text-[9px] md:text-[10px] text-mono font-bold tracking-[0.3em] border-b border-white/5 cursor-pointer transition-all duration-300 uppercase flex justify-between items-center group/cat-item no-underline ${
                        activeHoverCategory === cat.name ? 'text-accent bg-accent/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[7px] opacity-20">[{postsByCategory[cat.name]?.length || 0}]</span>
                    </Link>
                  ))}
                  <Link
                    to="/archive"
                    onClick={() => setIsTopicsOpen(false)}
                    className="mt-auto px-6 py-5 text-[9px] text-mono font-bold tracking-[0.3em] hover:bg-accent hover:text-white transition-all duration-300 uppercase text-center border-t border-white/5 no-underline text-accent"
                  >
                    TÜM ARŞİVİ GÖR →
                  </Link>
                </div>

                {/* CATEGORY PREVIEW (DESKTOP ONLY) */}
                <div className="hidden md:block flex-grow p-8 overflow-y-auto bg-[#050505] relative h-[420px]">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h4 className="text-mono text-[10px] font-black tracking-[0.4em] text-accent uppercase italic">
                      PREVIEW_DATA // {activeHoverCategory}
                    </h4>
                  </div>

                  <div className="space-y-1 animate-entry">
                    {postsByCategory[activeHoverCategory]?.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {postsByCategory[activeHoverCategory].slice(0, 5).map((post) => (
                          <Link 
                            to={`/post/${post.id}`} 
                            key={post.id} 
                            onClick={() => setIsTopicsOpen(false)}
                            className="group/post-item flex items-center justify-between py-4 transition-all no-underline"
                          >
                            <div className="flex-grow">
                              <h5 className="text-[14px] font-black tracking-tighter uppercase group-hover/post-item:text-accent transition-all text-white/70">
                                {post.title}
                              </h5>
                              <div className="flex gap-4 mt-1">
                                <span className="text-[8px] font-mono opacity-20 uppercase tracking-widest">{post.date}</span>
                              </div>
                            </div>
                            <span className="text-accent opacity-0 group-hover/post-item:opacity-100 transition-all -translate-x-2 group-hover/post-item:translate-x-0 font-bold">→</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center opacity-10">
                        <div className="text-mono text-[10px] tracking-[0.5em] uppercase">NO_RECORDS_FOUND</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MÜELLİF LINK */}
            <Link 
              to="/author" 
              className="flex items-center px-4 md:px-10 text-[8px] md:text-[10px] text-mono font-bold tracking-[0.2em] md:tracking-[0.4em] text-white/60 hover:text-accent transition-colors uppercase whitespace-nowrap no-underline"
            >
              MÜELLİF
            </Link>
          </div>

          {/* STATUS INDICATOR (DESKTOP ONLY) */}
          <div className="hidden lg:flex items-center px-8 text-mono text-[9px] text-accent font-bold tracking-[0.3em] uppercase border-l border-white/5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 bg-accent rounded-full mr-3 animate-pulse"></span>
            SYNC: OK
          </div>
        </nav>
      )}
      
      {/* MAIN CONTENT AREA */}
      <main className={`${!isAdminPage ? "pt-14 md:pt-20" : ""} bg-black text-white relative z-10`}>
        {children}
      </main>
      
      {/* FOOTER */}
      {!isAdminPage && (
        <footer className="py-16 md:py-24 px-6 md:px-10 border-t border-white/5 bg-black relative z-10">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">{config.siteTitle}</h2>
              <p className="max-w-xs text-gray-500 text-xs leading-relaxed font-light border-l border-accent pl-4 italic">
                Kültürel mirasın dijital muhafazası ve restorasyon teknolojileri için geliştirilmiş açık protokol.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-12 md:gap-20">
              <div className="space-y-4">
                <span className="text-mono text-[9px] text-accent font-bold tracking-widest uppercase">Navigasyon</span>
                <ul className="space-y-2 text-[10px] font-bold tracking-widest text-white/60 list-none p-0">
                  <li><Link to="/archive" className="hover:text-accent transition-colors uppercase no-underline">ARŞİV DİZİNİ</Link></li>
                  <li><Link to="/author" className="hover:text-accent transition-colors uppercase no-underline">MÜELLİF HAKKINDA</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <span className="text-mono text-[9px] text-accent font-bold tracking-widest uppercase">Sosyal Kanallar</span>
                <ul className="space-y-2 text-[10px] font-bold tracking-widest text-white/60 list-none p-0">
                  <li><a href={config.socialLinks.instagram} target="_blank" className="hover:text-accent transition-colors uppercase no-underline">INSTAGRAM</a></li>
                  <li><a href={config.socialLinks.linkedin} target="_blank" className="hover:text-accent transition-colors uppercase no-underline">LINKEDIN</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 md:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-mono text-[9px] text-gray-600 tracking-[0.5em] uppercase">
              TESSERA_PROTOCOL // <span className="text-accent font-black">V2.6</span>
            </div>
            <p className="text-[9px] text-white/20 font-bold tracking-widest uppercase italic text-center">
              DIGITAL_ARCHIVE_CORE // ALL RIGHTS RESERVED
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
