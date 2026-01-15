
import React, { useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import { ContactForm } from '../components/ContactForm';

export const Author: React.FC = () => {
  const { config } = useSite();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-black min-h-screen animate-entry">
      {/* Hero / Identity Section */}
      <section className="px-10 py-40 max-w-screen-2xl mx-auto border-b border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-end">
          <div className="lg:col-span-8">
            <div className="text-mono text-[10px] font-bold tracking-[0.5em] opacity-30 uppercase mb-10">MÜELLİF // IDENTITY_ROOT</div>
            <h1 className="text-7xl md:text-[10vw] font-black tracking-tighter leading-[0.8] mb-12 uppercase italic">
              {config.authorName}
            </h1>
            <p className="text-2xl md:text-4xl font-light text-gray-400 tracking-tight max-w-3xl leading-tight">
              {config.authorTitle}
            </p>
          </div>
          <div className="lg:col-span-4 aspect-[4/5] overflow-hidden border border-white/10 grayscale">
            <img 
              src={config.authorImage} 
              alt={config.authorName}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-[3s]"
            />
          </div>
        </div>
      </section>

      {/* Bio / Philosophy Section */}
      <section className="px-10 py-32 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 border-b border-white/10">
        <div className="lg:col-span-4">
          <h2 className="text-mono text-[10px] opacity-30 font-bold tracking-widest uppercase mb-10">01/ VİZYON & METODOLOJİ</h2>
        </div>
        <div className="lg:col-span-8">
          <div className="space-y-12">
            <p className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none text-white">
              "{config.authorPhilosophy}"
            </p>
            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-3xl whitespace-pre-wrap">
              {config.authorBio}
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio / Focus Areas Section */}
      <section className="px-10 py-32 max-w-screen-2xl mx-auto border-b border-white/10">
        <div className="flex items-baseline gap-10 mb-20">
          <span className="text-mono text-[10px] opacity-20 font-bold tracking-widest">02/</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">PORTFOLYO ODAKLARI</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {config.focusAreas.map(area => (
            <div key={area.id} className="bg-white/5 p-12 space-y-8 hover:bg-white hover:text-black transition-all duration-700 group border border-white/5">
              <span className="text-mono text-xs opacity-30 group-hover:text-black group-hover:opacity-100 transition-all font-bold">[{area.id}]</span>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">{area.title}</h3>
              <p className="text-gray-500 group-hover:text-black/70 transition-colors font-light leading-relaxed">
                {area.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* GitHub Projects Section */}
      {config.githubProjects.length > 0 && (
        <section className="px-10 py-32 max-w-screen-2xl mx-auto border-b border-white/10">
          <div className="flex items-baseline gap-10 mb-20">
            <span className="text-mono text-[10px] opacity-20 font-bold tracking-widest">03/</span>
            <h2 className="text-5xl font-black tracking-tighter uppercase">DİJİTAL ARTIFAKTLAR (CODE)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
            {config.githubProjects.map(proj => (
              <a 
                key={proj.id} 
                href={proj.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black p-10 hover:bg-white hover:text-black transition-all duration-500 group"
              >
                <div className="flex justify-between items-start mb-10">
                  <span className="text-mono text-[10px] font-bold opacity-30 group-hover:text-black group-hover:opacity-100 transition-all uppercase">[{proj.language}]</span>
                  <div className="flex items-center gap-2 opacity-30 group-hover:text-black group-hover:opacity-100 transition-all">
                    <span className="text-mono text-[10px] font-bold">★ {proj.stars}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase mb-6 group-hover:italic transition-all">{proj.name}</h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed mb-10 line-clamp-2 group-hover:text-black/70 transition-colors">
                  {proj.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-white/20 group-hover:bg-black/20 transition-colors"></div>
                  <span className="text-[9px] text-mono font-bold tracking-[0.3em] uppercase">REPOSITORY_VIEW</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-white/5 border-t border-white/10">
        <div className="px-10 py-32 max-w-screen-2xl mx-auto">
          <div className="flex items-baseline gap-10 mb-12">
            <span className="text-mono text-[10px] opacity-20 font-bold tracking-widest">04/</span>
            <h2 className="text-5xl font-black tracking-tighter uppercase">DOĞRUDAN BAĞLANTI</h2>
          </div>
          <p className="text-mono text-[10px] opacity-40 uppercase tracking-[0.3em] font-bold mb-20">PROTOTYPE // SECURE_COMMUNICATION_PROTOCOL</p>
          <ContactForm />
        </div>
      </section>
    </div>
  );
};
