export type League =
  | 'Premier League' | 'Championship' | 'League One' | 'League Two'
  | 'Scottish Premiership' | 'Scottish Championship' | 'Scottish League One' | 'Scottish League Two'
  | 'Non-League' | 'European';

export interface TeamBadge {
  name: string;
  badge: string;
  league: League;
  shortName?: string;
}

export const ALL_TEAMS: TeamBadge[] = [
  // Premier League
  { name: "Arsenal", badge: "/badges/arsenal.png", league: "Premier League" },
  { name: "Aston Villa", badge: "/badges/aston_villa.png", league: "Premier League" },
  { name: "Bournemouth", badge: "/badges/bournemouth.png", league: "Premier League" },
  { name: "Brentford", badge: "/badges/brentford.png", league: "Premier League" },
  { name: "Brighton", badge: "/badges/brighton.png", league: "Premier League" },
  { name: "Chelsea", badge: "/badges/chelsea.png", league: "Premier League" },
  { name: "Crystal Palace", badge: "/badges/crystal_palace.png", league: "Premier League" },
  { name: "Coventry City", badge: "/badges/coventry_city.png", league: "Premier League" },
  { name: "Everton", badge: "/badges/everton.png", league: "Premier League" },
  { name: "Fulham", badge: "/badges/fulham.png", league: "Premier League" },
  { name: "Hull City", badge: "/badges/hull_city.png", league: "Premier League" },
  { name: "Ipswich Town", badge: "/badges/ipswich_town.png", league: "Premier League" },
  { name: "Leicester City", badge: "/badges/leicester_city.png", league: "Premier League" },
  { name: "Leeds United", badge: "/badges/leeds_united.png", league: "Premier League" },
  { name: "Liverpool", badge: "/badges/liverpool.png", league: "Premier League" },
  { name: "Manchester City", badge: "/badges/manchester_city.png", league: "Premier League" },
  { name: "Manchester United", badge: "/badges/manchester_united.png", league: "Premier League" },
  { name: "Newcastle United", badge: "/badges/newcastle_united.png", league: "Premier League" },
  { name: "Nottingham Forest", badge: "/badges/nottingham_forest.png", league: "Premier League" },
  { name: "Southampton", badge: "/badges/southampton.png", league: "Premier League" },
  { name: "Sunderland", badge: "/badges/sunderland.png", league: "Premier League" },
  { name: "Tottenham Hotspur", badge: "/badges/tottenham_hotspur.png", league: "Premier League" },

  // Championship
  { name: "Burnley", badge: "/badges/burnley.png", league: "Championship" },
  { name: "West Ham United", badge: "/badges/west_ham_united.png", league: "Championship" },
  { name: "Wolverhampton Wanderers", badge: "/badges/wolverhampton.png", league: "Championship" },
  { name: "Sheffield United", badge: "/badges/sheffield_united.png", league: "Championship" },
  { name: "Bristol City", badge: "/badges/bristol_city.png", league: "Championship" },
  { name: "West Bromwich Albion", badge: "/badges/west_bromwich_albion.png", league: "Championship" },
  { name: "Middlesbrough", badge: "/badges/middlesbrough.png", league: "Championship" },
  { name: "Swansea City", badge: "/badges/swansea_city.png", league: "Championship" },
  { name: "Millwall", badge: "/badges/millwall.png", league: "Championship" },
  { name: "Preston North End", badge: "/badges/preston_north_end.png", league: "Championship" },
  { name: "Cardiff City", badge: "/badges/cardiff_city.png", league: "Championship" },
  { name: "Norwich City", badge: "/badges/norwich_city.png", league: "Championship" },
  { name: "Watford", badge: "/badges/watford.png", league: "Championship" },
  { name: "Stoke City", badge: "/badges/stoke_city.png", league: "Championship" },
  { name: "Birmingham City", badge: "/badges/birmingham_city.png", league: "Championship" },
  { name: "Derby County", badge: "/badges/derby_county.png", league: "Championship" },
  { name: "Luton Town", badge: "/badges/luton_town.png", league: "Championship" },
  { name: "Portsmouth", badge: "/badges/portsmouth.png", league: "Championship" },
  { name: "Oxford United", badge: "/badges/oxford_united.png", league: "Championship" },
  { name: "Bristol Rovers", badge: "/badges/bristol_rovers.png", league: "Championship" },
  { name: "Plymouth Argyle", badge: "/badges/plymouth_argyle.png", league: "Championship" },
  { name: "Sheffield Wednesday", badge: "/badges/sheffield_wednesday.png", league: "Championship" },
  { name: "QPR", badge: "/badges/qpr.png", league: "Championship", shortName: "QPR" },

  // League One
  { name: "Barnsley", badge: "/badges/barnsley.png", league: "League One" },
  { name: "Bolton Wanderers", badge: "/badges/bolton_wanderers.png", league: "League One" },
  { name: "Burton Albion", badge: "/badges/burton_albion.png", league: "League One" },
  { name: "Cambridge United", badge: "/badges/cambridge_united.png", league: "League One" },
  { name: "Charlton Athletic", badge: "/badges/charlton_athletic.png", league: "League One" },
  { name: "Cheltenham Town", badge: "/badges/cheltenham_town.png", league: "League One" },
  { name: "Wigan Athletic", badge: "/badges/wigan_athletic.png", league: "League One" },
  { name: "Wycombe Wanderers", badge: "/badges/wycombe_wanderers.png", league: "League One" },
  { name: "Lincoln City", badge: "/badges/lincoln_city.png", league: "League One" },
  { name: "Peterborough United", badge: "/badges/peterborough_united.png", league: "League One" },
  { name: "Northampton Town", badge: "/badges/northampton_town.png", league: "League One" },
  { name: "Mansfield Town", badge: "/badges/mansfield_town.png", league: "League One" },
  { name: "Leyton Orient", badge: "/badges/leyton_orient.png", league: "League One" },
  { name: "Reading", badge: "/badges/reading.png", league: "League One" },
  { name: "Rotherham United", badge: "/badges/rotherham_united.png", league: "League One" },
  { name: "Salford City", badge: "/badges/salford_city.png", league: "League One" },
  { name: "Shrewsbury Town", badge: "/badges/shrewsbury_town.png", league: "League One" },
  { name: "Stevenage", badge: "/badges/stevenage.png", league: "League One" },
  { name: "Walsall", badge: "/badges/walsall.png", league: "League One" },
  { name: "AFC Bournemouth", badge: "/badges/bournemouth.png", league: "League One" },
  { name: "Huddersfield Town", badge: "/badges/huddersfield_town.png", league: "League One" },

  // League Two
  { name: "Accrington Stanley", badge: "/badges/accrington_stanley.png", league: "League Two" },
  { name: "Aldershot Town", badge: "/badges/aldershot_town.png", league: "League Two" },
  { name: "Altrincham", badge: "/badges/altrincham.png", league: "League Two" },
  { name: "Barrow", badge: "/badges/barrow.png", league: "League Two" },
  { name: "Carlisle United", badge: "/badges/carlisle_united.png", league: "League Two" },
  { name: "Colchester United", badge: "/badges/colchester_united.png", league: "League Two" },
  { name: "Crawley Town", badge: "/badges/crawley_town.png", league: "League Two" },
  { name: "Crewe Alexandra", badge: "/badges/crewe_alexandra.png", league: "League Two" },
  { name: "Doncaster Rovers", badge: "/badges/doncaster_rovers.png", league: "League Two" },
  { name: "Fleetwood Town", badge: "/badges/fleetwood_town.png", league: "League Two" },
  { name: "Gillingham", badge: "/badges/gillingham.png", league: "League Two" },
  { name: "Grimsby Town", badge: "/badges/grimsby_town.png", league: "League Two" },
  { name: "Harrogate Town", badge: "/badges/harrogate_town.png", league: "League Two" },
  { name: "Hartlepool United", badge: "/badges/hartlepool_united.png", league: "League Two" },
  { name: "Hereford United", badge: "/badges/hereford_united.png", league: "League Two" },
  { name: "King's Lynn Town", badge: "/badges/kings_lynn_town.png", league: "League Two" },
  { name: "Milton Keynes Dons", badge: "/badges/milton_keynes_dons.png", league: "League Two", shortName: "MK Dons" },
  { name: "Morecambe", badge: "/badges/morecambe.png", league: "League Two" },
  { name: "Port Vale", badge: "/badges/port_vale.png", league: "League Two" },
  { name: "Swindon Town", badge: "/badges/swindon_town.png", league: "League Two" },
  { name: "Tranmere Rovers", badge: "/badges/tranmere_rovers.png", league: "League Two" },
  { name: "Wrexham", badge: "/badges/wrexham.png", league: "League Two" },
  { name: "Yeovil Town", badge: "/badges/yeovil_town.png", league: "League Two" },
  { name: "York City", badge: "/badges/york_city.png", league: "League Two" },

  // Scottish Premiership
  { name: "Celtic", badge: "/badges/celtic.png", league: "Scottish Premiership" },
  { name: "Rangers", badge: "/badges/rangers.png", league: "Scottish Premiership" },
  { name: "Aberdeen", badge: "/badges/aberdeen.png", league: "Scottish Premiership" },
  { name: "Heart of Midlothian", badge: "/badges/hearts.png", league: "Scottish Premiership", shortName: "Hearts" },
  { name: "Hibernian", badge: "/badges/hibernian.png", league: "Scottish Premiership", shortName: "Hibs" },
  { name: "Motherwell", badge: "/badges/motherwell.png", league: "Scottish Premiership" },
  { name: "St Johnstone", badge: "/badges/st_johnstone.png", league: "Scottish Premiership" },
  { name: "Dundee United", badge: "/badges/dundee_united.png", league: "Scottish Premiership" },
  { name: "Ross County", badge: "/badges/ross_county.png", league: "Scottish Premiership" },
  { name: "St Mirren", badge: "/badges/st_mirren.png", league: "Scottish Premiership" },
  { name: "Kilmarnock", badge: "/badges/kilmarnock.png", league: "Scottish Premiership" },
  { name: "Livingston", badge: "/badges/livingston.png", league: "Scottish Premiership" },

  // Scottish Championship
  { name: "Dundee FC", badge: "/badges/dundee_fc.png", league: "Scottish Championship" },
  { name: "Greenock Morton", badge: "/badges/greenock_morton.png", league: "Scottish Championship" },
  { name: "Partick Thistle", badge: "/badges/partick_thistle.png", league: "Scottish Championship" },
  { name: "Queen's Park", badge: "/badges/queens_park.png", league: "Scottish Championship" },
  { name: "Raith Rovers", badge: "/badges/raith_rovers.png", league: "Scottish Championship" },
  { name: "Falkirk", badge: "/badges/falkirk.png", league: "Scottish Championship" },
  { name: "Ayr United", badge: "/badges/ayr_united.png", league: "Scottish Championship" },
  { name: "Hamilton Academical", badge: "/badges/hamilton_academical.png", league: "Scottish Championship", shortName: "Hamilton" },

  // Scottish League One
  { name: "Cove Rangers", badge: "/badges/cove_rangers.png", league: "Scottish League One" },
  { name: "Montrose", badge: "/badges/montrose.png", league: "Scottish League One" },
  { name: "Stirling Albion", badge: "/badges/stirling_albion.png", league: "Scottish League One" },
  { name: "Dumbarton", badge: "/badges/dumbarton.png", league: "Scottish League One" },

  // Scottish League Two
  { name: "Annan Athletic", badge: "/badges/annan_athletic.png", league: "Scottish League Two" },
  { name: "Elgin City", badge: "/badges/elgin_city.png", league: "Scottish League Two" },
  { name: "Forfar Athletic", badge: "/badges/forfar_athletic.png", league: "Scottish League Two" },

  // Non-League
  { name: "FC United of Manchester", badge: "/badges/fc_united.png", league: "Non-League" },

  // European (Super Cup, friendlies, etc.)
  { name: "Paris Saint-Germain", badge: "/badges/paris_saint_germain.png", league: "European" },
];

export const PREMIER_LEAGUE_TEAMS = ALL_TEAMS.filter(t => t.league === "Premier League");

export function findTeam(name: string): TeamBadge | undefined {
  return ALL_TEAMS.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}

export function getTeamsByLeague(league: TeamBadge['league']) {
  return ALL_TEAMS.filter((t) => t.league === league);
}