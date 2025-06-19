import { PageProps } from "gatsby";
import React from "react";
import Delete from "../features/alert/Delete";
import Layout from "../features/layout/Layout";

type DeletePageParams = {
  alertId?: string | null;
};

const DeletePage: React.FC<PageProps> = ({ location }) => {
  const searchParams = new URLSearchParams(location.search);
  const urlParams: DeletePageParams = {
    alertId: searchParams.get('alertId'),
  };
  const alertId = urlParams.alertId || '';

  return (
    <Layout>
      <Delete alertId={alertId} />
    </Layout>
  )
}

export default DeletePage

export const Head = () => <title>OpenTee - Delete Alert</title>
