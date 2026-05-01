/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/90sfootball',
        destination: 'https://www.90sfootball.com/?utm_source=Partner&utm_medium=Website&utm_campaign=Play+Predict+Win',
        permanent: false,
      },
      {
        source: '/telescore',
        destination: 'https://www.telescore.app/home?utm_source=Partner&utm_medium=Website&utm_campaign=Play+Predict+Win',
        permanent: false,
      },
      {
        source: '/3retro',
        destination: 'https://assets.ikhnaie.me/click.html?wgcampaignid=1747476&wgprogramid=310484',
        permanent: false,
      },
      {
        source: '/allstarsignings',
        destination: 'https://assets.ikhnaie.me/click.html?wgcampaignid=1747476&wgprogramid=295320',
        permanent: false,
      },
      {
        source: '/butterworths',
        destination: 'https://assets.ikhnaie.me/click.html?wgcampaignid=1747476&wgprogramid=310418',
        permanent: false,
      },
      {
        source: '/retrofm',
        destination: 'https://rfm25.onelink.me/AFls/ppw',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Robots-Tag', value: 'index, follow' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;