
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { config } = useSite();
  const navigate = useNavigate();
  const post = config.posts.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">KAYIT BULUNAMADI</h1>
        <p className="text-mono text-xs opacity-40 mb-8">VERİTABANI HATASI: 404_NOT_FOUND</p>
        <Link to="/" className="text-mono text-[10px] border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all font-bold tracking-[0.3em]">ANA SAYFAYA DÖN</Link>
      </div>
    );
  }

  return (
    <article className="bg-black min-h-screen">
      {/* Header Image */}
      <div className="w-full h-[70vh] relative overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-6 mb-8 text-mono text-xs tracking-[0.3em] font-bold">
              <span className="bg-white text-black px-3 py-1">{post.category}</span>
              <span className="opacity-60">{post.date}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase max-w-5xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-8 md:px-20 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <aside className="lg:col-span-3 space-y-12">
          <div className="border-t border-white/10 pt-8">
            <span className="text-mono text-[10px] opacity-30 block mb-4 tracking-[0.2em] font-bold uppercase">Meta Verileri</span>
            <div className="space-y-4 text-mono text-[11px] font-bold uppercase tracking-widest">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-40">KİMLİK:</span>
                <span>REC_0x{post.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-40">SÜRE:</span>
                <span>{post.readingTime}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="opacity-40">ERİŞİM:</span>
                <span>AÇIK ARŞİV</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-4 text-mono text-[10px] tracking-[0.3em] font-black uppercase"
          >
            <span className="group-hover:-translate-x-2 transition-transform">←</span> GERİ DÖN
          </button>
        </aside>

        <div className="lg:col-span-7 space-y-12">
          <p className="text-2xl md:text-3xl text-gray-400 leading-tight font-light border-l border-white/20 pl-8 mb-16 italic">
            {post.excerpt}
          </p>
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-lg mb-8 font-light">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};
