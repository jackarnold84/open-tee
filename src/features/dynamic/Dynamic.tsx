import { Avatar, List, Skeleton } from "antd";
import React from "react";
import useSWR from "swr";
import Container from "../../components/Container";
import { fetchTeams } from "./espnApi";

interface DynamicProps {
  league?: string;
}

const Dynamic: React.FC<DynamicProps> = ({ league = '' }) => {
  const validLeague = ['nba', 'mlb', 'nfl'].includes(league);
  const leagueHeader = `${league.toUpperCase()} Teams`;

  const { data: teamData, error, isLoading } = useSWR(
    validLeague ? { league, clientId: "WEB" } : null,
    fetchTeams
  );

  const skeletonData = Array.from({ length: 5 }).map(() => ({
    name: '', abbreviation: '', color: '',
  }));

  return (
    <>
      <Container size={16} centered >
        <h2>Example API Call</h2>
      </Container>

      {validLeague ? (
        <Container size={16} centered >
          <h4>{leagueHeader}</h4>
        </Container>
      ) : (
        <Container size={16} centered >
          <h4>Invalid league selected</h4>
        </Container>
      )}

      {error ? (
        <Container centered >
          <div>There was an error calling the API</div>
        </Container>
      ) : (
        <Container>
          <List
            itemLayout="horizontal"
            size="small"
            dataSource={isLoading ? skeletonData : teamData}
            renderItem={item => (
              <List.Item>
                <Skeleton avatar title={false} loading={isLoading} active>
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: `#${item.color}` }}>
                        {item.abbreviation}
                      </Avatar>
                    }
                    title={item.name}
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </Container>
      )}
    </ >
  )
}

export default Dynamic
