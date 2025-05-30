interface Request {
  league: League;
  clientId: string;
}

interface TeamData {
  name: string;
  abbreviation: string;
  color: string;
}

type League = 'nba' | 'mlb' | 'nfl';

const leaguePathMap: { [key in League]: string } = {
  nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba',
  mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb',
  nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
}

export const fetchTeams = async (request: Request) => {
  const { league, clientId } = request;
  const queryParams = new URLSearchParams({ 'clientId': clientId });
  const url = `${leaguePathMap[league]}/teams?${queryParams.toString()}`;

  const response = await fetch(url);
  const result = await response.json();
  const teams = result.sports[0].leagues[0].teams;
  const teamData: TeamData[] = teams.map((x: any) => ({
    name: x.team.displayName,
    abbreviation: x.team.abbreviation,
    color: x.team.color,
  }));
  // intentional delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 2000));
  return teamData;
}
