import PublicNav from '@/components/PublicNav';
import { blogPosts } from '@/lib/blog-data';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Football Prediction Blog | World Cup 2026 Tips & Guides',
  description: 'Expert football prediction guides, World Cup 2026 strategy tips, and match analysis to help you win your prediction league.',
  openGraph: {
    title: 'Football Prediction Blog | World Cup 2026 Tips & Guides',
    description: 'Expert football prediction guides and World Cup 2026 strategy tips to help you win your prediction league.',
    type: 'website',
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3">Prediction Blog</h1>
          <p className="text-textMuted text-lg">World Cup guides, prediction strategy, and match analysis</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <article key={post.slug} className={`card group overflow-hidden flex flex-col ${i === 0 ? 'md:col-span-3' : ''}`}>
              <Link href={`/blog/${post.slug}`} className="block">
                <div className={`relative overflow-hidden ${i === 0 ? 'h-64' : 'h-40'}`}>
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes={i === 0 ? '(max-width: 768px) 100vw, 800px' : '(max-width: 768px) 100vw, 400px'}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="text-xs bg-primary/80 text-white px-2 py-0.5 rounded font-medium">{post.category}</span>
                  </div>
                </div>
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <Link href={`/blog/${post.slug}`} className="block flex-1">
                  <h2 className={`font-bold leading-tight mb-2 group-hover:text-primary transition-colors ${i === 0 ? 'text-2xl' : 'text-lg'}`}>
                    {post.title}
                  </h2>
                  <p className="text-textMuted text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                </Link>
                <div className="flex items-center justify-between text-xs text-textMuted pt-4 border-t border-border mt-auto">
                  <span>{post.author} · {post.date}</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}