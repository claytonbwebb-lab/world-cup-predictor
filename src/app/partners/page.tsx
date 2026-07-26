import Image from 'next/image';
import Footer from '@/components/Footer';
import Link from 'next/link';
import NavBar from '@/components/NavBar';

const partners = [
  {
    name: '90s Football',
    logo: '/images/partners/90sfootball.png',
    url: '/90sfootball',
    alt: '90s Football',
    tagline: 'Relive the golden era of football',
    description: '90s Football is the ultimate destination for fans of the beautiful game\'s greatest decade. From Premier League legends to tournament heroes, they celebrate the players, moments and kits that defined an era. Follow them for nostalgia, stats, and unrivalled football content.',
    stats: '800K+ followers across social platforms',
    bgImage: '/images/partners/90s-football-partner-bg.png',
    bgAlt: '90s Football — vintage football shirts and memorabilia display',
    bgPosition: 'top center',
  },
  {
    name: 'Telescore',
    logo: '/images/partners/footbal12.png',
    url: '/telescore',
    alt: 'Telescore',
    tagline: 'The beautiful game, covered beautifully',
    description: 'Telescore delivers comprehensive coverage of the sport we all love — from grassroots to the biggest stages on earth. Whether it\'s transfer news, match analysis, or exclusive interviews, they bring the depth and passion every football fan deserves.',
    stats: 'Trusted by 135,000 users',
    bgImage: '/images/partners/telescore-partner-bg.jpg',
    bgAlt: 'Telescore — mobile football scores app on smartphone screens',
    bgPosition: 'top center',
  },
  {
    name: '3Retro',
    logo: '/images/partners/3retro.png',
    url: '/3retro',
    alt: '3Retro',
    tagline: 'Vintage footballwear for modern fans',
    description: "3Retro is the home of retro football, bringing together a curated range of classic shirts and vintage sportswear. With a focus on quality, authenticity and timeless style, 3Retro celebrates the era of replica kits redefined and reborn for today's fans and collectors.",
    stats: 'Replica. Redefined. Reborn.',
    bgImage: '/images/partners/3retro-partner-bg.jpg',
    bgAlt: '3Retro — collection of vintage football shirts and retro jerseys',
    bgPosition: 'top center',
  },
  {
    name: 'Allstar Signings',
    logo: '/images/partners/allstarsignings.png',
    url: '/allstarsignings',
    alt: 'Allstar Signings',
    tagline: 'Authentic memorabilia from football\'s biggest names',
    description: 'Allstar Signings is the go-to source for authenticated football memorabilia — from signed shirts to exclusive event appearances. They work directly with players and clubs to bring fans genuine pieces of football history.',
    stats: `We don't just tell you it's authentic...we show you!`,
    bgImage: '/images/partners/allstar-signings-partner-bg.jpg',
    bgAlt: 'Allstar Signings — signed football shirts and memorabilia display',
    bgPosition: 'top center',
  },
  {
    name: "Butterworths",
    logo: '/images/partners/butterworths.png',
    url: '/butterworths',
    alt: "Butterworth's",
    tagline: `Online menswear fashion brands`,
    description: "Butterworths is a menswear destination for iconic fashion brands that have long been embraced by the casuals scene. Built around timeless style, quality and everyday wearability, it brings together classic labels that appeal to shoppers who value heritage, authenticity and standout design.",
    stats: `Everyday menswear that speaks confidence.`,
    bgImage: '/images/partners/butterworths-partner-bg.jpg',
    bgAlt: "Butterworth's — football themed artwork and prints",
  },
  {
    name: 'Retro Football Manager',
    logo: '/images/partners/rfm.png',
    url: '/retrofm',
    alt: 'Retro Football Manager',
    tagline: 'Step back into football\'s greatest managerial era',
    description: "Retro Football Manager is a wildly popular free-to-play, free-to-download retro football app with over 150k active users reliving bygone eras—pick any historic season or team, climb leaderboards, and win prizes as a true student of the game.",
    stats: "Be careful it's addictive!",
    bgImage: '/images/partners/retro-football-manager-partner-bg.png',
    bgAlt: 'Retro Football Manager — football management magazine and retro tactics',
    bgPosition: 'center 80%',
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
            We're proud to partner with some of the biggest names in football culture. 
            Each partner shares our passion for the beautiful game — check them out below.
          </p>
        </div>

        {/* Partner cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {partners.map(partner => partner.bgImage ? (
            <div key={partner.name} className="card overflow-hidden border-border hover:border-primary/40 transition-all group">
              {/* Logo section with background image */}
              <div className="relative h-48 overflow-hidden">
                <Image src={partner.bgImage} alt={partner.bgAlt} fill style={{ objectFit: 'cover', objectPosition: partner.bgPosition || 'center' }} sizes="(max-width: 768px) 100vw, 50vw" priority={false} />
                <div className="absolute inset-0 bg-background/30" />
              </div>
              {/* Content section */}
              <div className="p-6">
                <div className="flex items-center justify-center -mt-24 mb-4 relative z-10">
                  <div className="bg-background/80 rounded-xl p-4">
                    <Image src={partner.logo} alt={partner.alt} width={180} height={72} className="object-contain max-h-[72px]" />
                  </div>
                </div>
                <p className="text-primary text-sm font-semibold mb-1">{partner.tagline}</p>
                <h2 className="text-2xl font-black mb-3">{partner.name}</h2>
                <p className="text-textMuted leading-relaxed mb-4">{partner.description}</p>
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="text-yellow-400">★</span>
                  <span className="text-textMuted">{partner.stats}</span>
                </div>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
                  Visit {partner.name} →
                </a>
              </div>
            </div>
          ) : (
            <div key={partner.name} className="card border-border hover:border-primary/40 transition-all group">
              {/* Logo */}
              <div className="flex items-center justify-center h-32 bg-surface/50 rounded-xl mb-6 px-6">
                <Image src={partner.logo} alt={partner.alt} width={220} height={90} className="object-contain max-h-full" />
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
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block mt-2">
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
            We're always looking to collaborate with brands that share our love for football. 
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
      <Footer />
    </div>
  );
}