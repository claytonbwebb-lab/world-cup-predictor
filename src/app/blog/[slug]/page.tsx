import { blogPosts } from '@/lib/blog-data';
import PublicNav from '@/components/PublicNav';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Play Predict Win Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.dateIso,
      authors: [post.author],
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  if (!post) notFound();

  const otherPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-textMuted mb-6">
          <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-textMuted/60">{post.category}</span>
        </div>

        {/* Hero image */}
        <div className="relative h-72 rounded-xl overflow-hidden mb-8">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-textMuted">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{post.category}</span>
          <span>{post.date}</span>
          <span>{post.readingTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-6">{post.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border">
          <div className="bg-surface rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold text-primary">
            {post.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm">{post.author}</p>
            <p className="text-textMuted text-xs">{post.authorRole}</p>
          </div>
        </div>

        {/* Content — rendered as HTML-friendly prose */}
        <div className="prose prose-invert prose-sm max-w-none mb-12">
          {post.content.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-8 mb-3">{para.replace('## ', '')}</h2>;
            if (para.startsWith('**') && para.endsWith('**')) return <h3 key={i} className="text-base font-bold mt-6 mb-2 text-primary">{para.replace(/\*\*/g, '')}</h3>;
            if (para.startsWith('- **')) {
              const items = para.split('\n');
              return (
                <ul key={i} className="space-y-1 my-4">
                  {items.map((item, j) => {
                    const text = item.replace(/^- \*\*(.*?)\*\* — /, '$1: ').replace(/^- \*\*(.*?)\*\*/g, '$1');
                    return <li key={j} className="flex items-start gap-2 text-sm"><span className="text-primary mt-0.5">·</span><span>{text.replace(/\*\*/g, '').replace(/:$/, '')}</span></li>;
                  })}
                </ul>
              );
            }
            return <p key={i} className="text-textMuted leading-relaxed my-4">{para.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
          })}
        </div>

        {/* CTA */}
        <div className="bg-surface rounded-xl p-6 text-center mb-12">
          <p className="text-textMuted mb-4">Ready to test your prediction skills?</p>
          <Link href="/auth/signup" className="btn-primary px-8 py-3 rounded-xl font-bold inline-block">
            Join the Prediction League →
          </Link>
        </div>

        {/* Other posts */}
        {otherPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">More from the blog</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {otherPosts.map(p => (
                <article key={p.slug} className="card group overflow-hidden flex flex-col">
                  <Link href={`/blog/${p.slug}`} className="block">
                    <div className="relative h-36 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.imageAlt}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/blog/${p.slug}`} className="block flex-1">
                      <h3 className="font-bold text-sm leading-tight mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-textMuted text-xs line-clamp-2">{p.excerpt}</p>
                    </Link>
                    <div className="flex items-center justify-between text-xs text-textMuted pt-3 mt-3 border-t border-border">
                      <span>{p.date}</span>
                      <span>{p.readingTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}