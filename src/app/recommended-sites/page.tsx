'use client';

import Head from 'next/head';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const categories = [
  {
    id: 'predictions',
    name: 'Predictions',
    emoji: '🎯',
    description: 'AI-powered match predictions, win probabilities, and consensus forecasts from the community.',
    sites: [
      { name: 'PlayPredictWin', url: 'https://playpredictwin.com', desc: 'Your prediction league for World Cup 2026', featured: true },
      { name: 'FootyTipsters', url: 'https://footytipsters.com', desc: 'Verified tipsters with trackable records' },
      { name: 'Betegy', url: '#', desc: 'AI-powered match predictions using machine learning' },
    ],
  },
  {
    id: 'live-scores',
    name: 'Live Scores',
    emoji: '⚡',
    description: 'Real-time scores, match statistics, and live updates from around the world.',
    sites: [
      { name: 'Flashscore', url: 'https://www.flashscore.co.uk', desc: 'Live scores for 1000+ leagues worldwide' },
      { name: '365Scores', url: 'https://www.365scores.com', desc: 'Sports scores, news, and statistics' },
      { name: 'LiveScore', url: 'https://www.livescore.com', desc: 'Real-time football scores and results' },
    ],
  },
  {
    id: 'news',
    name: 'Football News',
    emoji: '📰',
    description: 'Breaking news, transfer updates, and expert analysis from trusted sources.',
    sites: [
      { name: 'Sky Sports Football', url: 'https://www.skysports.com/football', desc: 'Premier football news, transfers, and video' },
      { name: 'BBC Sport Football', url: 'https://www.bbc.co.uk/sport/football', desc: 'Reliable football news from BBC' },
      { name: 'Goal.com', url: 'https://www.goal.com/en', desc: 'World football news and transfer updates' },
      { name: 'The Athletic', url: 'https://theathletic.com/football', desc: 'In-depth football analysis and reporting' },
      { name: 'Football365', url: 'https://www.football365.com', desc: 'Football news, gossip, and columns' },
    ],
  },
  {
    id: 'stats',
    name: 'Statistics & Data',
    emoji: '📊',
    description: 'Advanced stats, player data, team analytics, and historical records.',
    sites: [
      { name: 'FBref', url: 'https://fbref.com/en/', desc: 'Comprehensive football statistics and comparables' },
      { name: 'WhoScored', url: 'https://www.whoscored.com', desc: 'Match stats and player ratings' },
      { name: 'Understat', url: 'https://www.understat.com', desc: 'Expected goals (xG) and advanced metrics' },
      { name: 'Transfermarkt', url: 'https://www.transfermarkt.co.uk', desc: 'Player valuations and transfer market data' },
      { name: 'FotMob', url: 'https://www.fotmob.com', desc: 'Live scores and detailed match statistics' },
      { name: 'Sofascore', url: 'https://www.sofascore.com', desc: 'Real-time scores and detailed analytics' },
    ],
  },
  {
    id: 'fantasy',
    name: 'Fantasy Football',
    emoji: '🎲',
    description: 'FPL tips, fantasy tools, differential picks, and community insights.',
    sites: [
      { name: 'Fantasy Premier League', url: 'https://fantasy.premierleague.com', desc: 'Official FPL game — join 10M+ players' },
      { name: 'Fantasy Football Scout', url: 'https://www.fantasyfootballscout.co.uk', desc: 'Premium FPL tips and differential picks' },
      { name: 'FantasyPros', url: 'https://www.fantasypros.com', desc: 'Fantasy football advice and projections' },
    ],
  },
  {
    id: 'podcasts',
    name: 'Podcasts',
    emoji: '🎧',
    description: 'Weekly football podcasts covering predictions, analysis, and hot takes.',
    sites: [
      { name: 'The Football Weekly', url: 'https://www.theguardian.com/football/football-weekly-podcast', desc: 'Guardian\'s weekly football podcast' },
      { name: 'Football Ramble', url: 'https://www.footballramble.com', desc: 'Daily football news and banter' },
      { name: 'The Athletic FC Podcast', url: '#', desc: 'In-depth analysis from The Athletic' },
      { name: 'Sky Sports Football Podcast', url: '#', desc: 'Video podcasts from Sky Sports experts' },
      { name: 'Football Cliches', url: 'https://www.footballcliches.com', desc: 'Podcast celebrating football culture' },
    ],
  },
  {
    id: 'transfers',
    name: 'Transfer News',
    emoji: '🔄',
    description: 'Reliable transfer rumours, done deals, contract expiry lists, and agent news.',
    sites: [
      { name: 'Transfermarkt', url: 'https://www.transfermarkt.co.uk', desc: 'The go-to source for transfer market data' },
      { name: 'Sky Sports Transfer Centre', url: 'https://www.skysports.com/transfer-centre', desc: 'Live transfer news and rumour mill' },
      { name: 'Fabrizio Romano', url: 'https://fabrizioromano.com', desc: 'Industry-leading transfer news source' },
    ],
  },
  {
    id: 'betting-tools',
    name: 'Betting Tools',
    emoji: '🧮',
    description: 'Odds comparison, betting calculators, value bet finders, and accumulator stats.',
    sites: [
      { name: 'Oddschecker', url: '#', desc: 'Compare odds from all major bookmakers' },
      { name: 'Betfair Exchange', url: '#', desc: 'Peer-to-peer betting exchange' },
      { name: 'Paddy Power', url: '#', desc: 'Odds, offers, and betting tools' },
    ],
  },
  {
    id: 'communities',
    name: 'Communities',
    emoji: '👥',
    description: 'Forums, Discord servers, Reddit feeds, and fan communities for discussion.',
    sites: [
      { name: 'Reddit Soccer', url: 'https://www.reddit.com/r/soccer', desc: 'Football discussions and news aggregation' },
      { name: 'RedCafe', url: 'https://www.redcafe.net', desc: 'Long-standing football forum community' },
      { name: 'Football Addicts', url: '#', desc: 'Active Discord community for fans' },
    ],
  },
  {
    id: 'quiz-games',
    name: 'Quiz & Games',
    emoji: '🕹️',
    description: 'Football quizzes, prediction games, trivia, and interactive challenges.',
    sites: [
      { name: 'PlayPredictWin', url: 'https://playpredictwin.com', desc: 'World Cup prediction league', featured: true },
      { name: 'Sporcle Football Quizzes', url: '#', desc: 'Football trivia and knowledge quizzes' },
    ],
  },
  {
    id: 'betting-sites',
    name: 'Best Betting Sites',
    emoji: '🏆',
    description: 'Trusted bookmaker reviews, sign-up offers, and exclusive deals.',
    sites: [
      { name: 'Bet365', url: '#', desc: 'Industry leading odds and live streaming' },
      { name: 'Betway', url: 'https://www.betway.com/en/sports', desc: 'Competitive odds and generous welcome offer' },
      { name: 'BetVictor', url: '#', desc: 'Enhanced odds and betting tools' },
      { name: 'talkSPORT BET', url: '#', desc: 'Radio-linked betting brand' },
    ],
  },
  {
    id: 'apps',
    name: 'Football Apps',
    emoji: '📱',
    description: 'Mobile apps for scores, news, stats, and betting on the go.',
    sites: [
      { name: 'FotMob', url: 'https://www.fotmob.com', desc: 'iOS & Android — live scores and stats' },
      { name: 'OneFootball', url: 'https://www.onefootball.com/en', desc: 'iOS & Android — news and scores' },
      { name: 'theScore', url: '#', desc: 'iOS & Android — scores and betting' },
    ],
  },
  {
    id: 'match-centre',
    name: 'Match Centre',
    emoji: '🏟️',
    description: 'Live scores, lineups, H2H records, form guides, and fan voting.',
    sites: [
      { name: 'Flashscore', url: 'https://www.flashscore.co.uk', desc: 'Live scores with match centre features' },
      { name: 'Soccerway', url: 'https://www.soccerway.com', desc: 'Lineups, stats, and match history' },
    ],
  },
];

export default function RecommendedSites() {
  return (
    <>
      <Head>
        <title>Recommended Sites — PlayPredictWin</title>
        <meta name="description" content="The best football websites, tools, and resources curated by PlayPredictWin. Predictions, live scores, stats, betting, and more." />
      </Head>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">⚽ Recommended Sites</h1>
            <p className="text-textMuted text-lg max-w-2xl mx-auto">
              Curated links to the best football resources online. Predictions, live scores, stats, betting tools, communities and more.
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid gap-8">
            {categories.map(cat => (
              <div key={cat.id} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h2 className="text-xl font-bold">{cat.name}</h2>
                </div>
                <p className="text-textMuted text-sm mb-5">{cat.description}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.sites.map(site => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col gap-1 p-4 rounded-lg bg-surfaceLight hover:bg-surface transition-colors ${site.featured ? 'border border-primary/50' : 'border border-border/50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{site.name}</span>
                        {site.featured && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                      <span className="text-textMuted text-xs">{site.desc}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 card text-center bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
            <h3 className="text-xl font-bold mb-2">Want to feature your site?</h3>
            <p className="text-textMuted text-sm mb-4">
              We partner with quality football sites for reciprocal linking. Get in touch to discuss.
            </p>
            <Link href="/partners" className="btn-primary inline-block">
              Partner With Us
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
