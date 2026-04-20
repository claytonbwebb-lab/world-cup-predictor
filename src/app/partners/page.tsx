import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const partners = [
  {
    name: '90s Football',
    logo: '/images/partners/90sfootball.png',
    url: 'https://bit.ly/4ceCmeF',
    alt: '90s Football',
    tagline: 'Relive the golden era of football',
    description: '90s Football is the ultimate destination for fans of the beautiful game\'s greatest decade. From Premier League legends to World Cup heroes, they celebrate the players, moments and kits that defined an era. Follow them for nostalgia, stats, and unrivalled football content.',
    stats: '100K+ followers across social platforms',
  },
  {
    name: 'FOOTBALL',
    logo: '/images/partners/footbal12.png',
    url: 'https://bit.ly/4tRRJ2o',
    alt: 'FOOTBALL',
    tagline: 'The beautiful game, covered beautifully',
    description: 'FOOTBALL delivers comprehensive coverage of the sport we all love — from grassroots to the biggest stages on earth. Whether it\'s transfer news, match analysis, or exclusive interviews, they bring the depth and passion every football fan deserves.',
    stats: 'Trusted by 50K+ readers monthly',
  },
  {
    name: '3Retro',
    logo: '/images/partners/3retro.png',
    url: 'https://bit.ly/4dPhtYE',
    alt: '3Retro',
    tagline: 'Vintage footballwear for modern fans',
    description: '3Retro is a curated marketplace for authentic vintage football shirts and apparel. Each piece is hand-picked for quality and authenticity, helping fans wear their football history with pride. From rare classics to iconic match-worn items.',
    stats: '500+ authentic vintage pieces',
  },
  {
    name: 'Allstar Signings',
    logo: '/images/partners/allstarsignings.png',
    url: 'https://bit.ly/4sw9t2t',
    alt: 'Allstar Signings',
    tagline: 'Authentic memorabilia from football\'s biggest names',
    description: 'Allstar Signings is the go-to source for authenticated football memorabilia — from signed shirts to exclusive event appearances. They work directly with players and clubs to bring fans genuine pieces of football history.',
    stats: 'Official licensed memorabilia partner',
  },
  {
    name: "Butterworths",
    logo: '/images/partners/butterworths.png',
    url: 'https://bit.ly/4vv6MAT',
    alt: "Butterworth's",
    tagline: 'Print and design with football at its heart',
    description: "Butterworth's is a creative design and print studio with deep roots in football culture. They produce high-quality artwork, prints and merchandise that celebrate the game — from iconic moments to minimalist tributes. Perfect for fans who want to display their passion.",
    stats: 'Handcrafted football artwork & prints',
  },
  {
    name: 'Retro Football Manager',
    logo: '/images/partners/rfm.png',
    url: 'https://rfm25.onelink.me/AFls/ppw',
    alt: 'Retro Football Manager',
    tagline: 'Step back into football\'s greatest managerial era',
    description: 'Retro Football Manager is a subscription-based magazine and community dedicated to the managers and tactics that shaped modern football. Packed with nostalgia, tactical analysis and exclusive features from football\'s greatest era — a must-read for students of the game.',
    stats: 'Quarterly print magazine + digital access',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Our Partners</p>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            <span className="text-primary">Supported</span> by the Best
          </h1>
          <p className="text-textMuted text-lg max-w-2xl mx-auto leading-relaxed">
            We\'re proud to partner with some of the biggest names in football culture. 
            Each partner shares our passion for the beautiful game — check them out below.
          </p>
        </div>

        {/* Partner cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {partners.map(partner => (
            <div key={partner.name} className="card border-border hover:border-primary/40 transition-all group">
              {/* Logo */}
              <div className="flex items-center justify-center h-32 bg-surface/50 rounded-xl mb-6 px-6">
                <Image 
                  src={partner.logo} 
                  alt={partner.alt} 
                  width={220} 
                  height={90}
                  className="object-contain max-h-full"
                />
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <p className="text-primary text-sm font-semibold mb-1">{partner.tagline}</p>
                  <h2 className="text-2xl font-black">{partner.name}</h2>
                </div>

                <p className="text-textMuted leading-relaxed">{partner.description}</p>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">★</span>
                  <span className="text-textMuted">{partner.stats}</span>
                </div>

                <a 
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center block mt-2"
                >
                  Visit {partner.name} →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 card text-center border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="text-2xl font-bold mb-3">Want to Partner With Us?</h2>
          <p className="text-textMuted max-w-md mx-auto mb-6">
            We\'re always looking to collaborate with brands that share our love for football. 
            Get in touch to discuss partnership opportunities.
          </p>
          <a 
            href="mailto:partners@playpredictwin.com"
            className="btn-primary inline-block"
          >
            Get in Touch
          </a>
        </div>

        {/* Back home link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-textMuted hover:text-text transition-colors text-sm">
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}