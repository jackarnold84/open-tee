import { PageProps } from "gatsby";
import React from "react";
import Dynamic from "../features/dynamic/Dynamic";
import Layout from "../features/layout/Layout";

type DynamicPageParams = {
  league?: string | null;
};

const DynamicPage: React.FC<PageProps> = ({ location }) => {
  const searchParams = new URLSearchParams(location.search);
  const urlParams: DynamicPageParams = {
    league: searchParams.get('league'),
  };
  const league = urlParams.league || '';

  return (
    <Layout>
      <Dynamic league={league} />
    </Layout>
  )
}

export default DynamicPage

export const Head = () => <title>API Page</title>
