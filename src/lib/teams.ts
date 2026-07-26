export interface TeamBadge {
  name: string;
  badge: string; // path relative to /public/badges e.g. "/badges/arsenal.png"
}

export const PREMIER_LEAGUE_TEAMS: TeamBadge[] = [
  { name: "Arsenal", badge: "/badges/arsenal.png" },
  { name: "Aston Villa", badge: "/badges/aston_villa.png" },
  { name: "Bournemouth", badge: "/badges/bournemouth.png" },
  { name: "Brentford", badge: "/badges/brentford.png" },
  { name: "Brighton", badge: "/badges/brighton.png" },
  { name: "Chelsea", badge: "/badges/chelsea.png" },
  { name: "Crystal Palace", badge: "/badges/crystal_palace.png" },
  { name: "Everton", badge: "/badges/everton.png" },
  { name: "Fulham", badge: "/badges/fulham.png" },
  { name: "Ipswich Town", badge: "/badges/ipswich_town.png" },
  { name: "Leicester City", badge: "/badges/leicester_city.png" },
  { name: "Liverpool", badge: "/badges/liverpool.png" },
  { name: "Manchester City", badge: "/badges/manchester_city.png" },
  { name: "Manchester United", badge: "/badges/manchester_united.png" },
  { name: "Newcastle United", badge: "/badges/newcastle_united.png" },
  { name: "Nottingham Forest", badge: "/badges/nottingham_forest.png" },
  { name: "Southampton", badge: "/badges/southampton.png" },
  { name: "Tottenham Hotspur", badge: "/badges/tottenham_hotspur.png" },
  { name: "West Ham United", badge: "/badges/west_ham_united.png" },
  { name: "Wolverhampton", badge: "/badges/wolverhampton.png" },
];

export function findTeam(name: string): TeamBadge | undefined {
  return PREMIER_LEAGUE_TEAMS.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}
